const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const passport = require("passport");

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME || "HomiGo";
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "no-reply@homigo.com";

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

async function sendOtpEmail(toEmail, otp) {
  if (!BREVO_API_KEY) {
    throw new Error("Brevo API key is not configured (BREVO_API_KEY)");
  }

  // Debug helper: ensure key is being read correctly
  console.log("[Brevo] key length:", BREVO_API_KEY.length, "first8:", BREVO_API_KEY.slice(0, 8));

  const payload = {
    sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
    to: [{ email: toEmail }],
    subject: "Your HomiGo verification code",
    htmlContent: `<html><body><h2 style="font-family: sans-serif;">Verify your HomiGo account</h2><p>Your verification code is:</p><p style="font-size: 2rem; font-weight: 700; letter-spacing: 0.15em;">${otp}</p><p>This code expires in <strong>1 minute</strong>.</p></body></html>`,
  };

  // If API key is not configured, log OTP instead of sending email (useful for local dev).
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set; OTP for", toEmail, "is", otp);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Brevo] send failed", res.status, res.statusText, body);
    if (res.status === 401) {
      throw new Error("Brevo API key is invalid or expired. Please update BREVO_API_KEY in .env.");
    }
    throw new Error(`Brevo send failed: ${res.status} ${res.statusText} ${body}`);
  }
}

module.exports.rendersignupform = (req, res) => {
  res.json({ success: true, message: "Render signup form" });
};

const clearPendingSignup = (req) => {
  req.session.pendingSignup = null;
};

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: "Username, email and password are required." });
    }

    // Prevent creating duplicate accounts
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "An account with this email already exists." });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 60 * 1000; // 1 minute

    // Save pending signup info in session until OTP is verified
    req.session.pendingSignup = {
      username,
      email,
      password,
      otp,
      expiresAt,
      attempts: 0,
    };

    await sendOtpEmail(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to your email.", expiresIn: 60 });
  } catch (e) {
    console.error("Signup OTP error:", e);
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports.verifySignupOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const pending = req.session.pendingSignup;

    if (!pending) {
      return res.status(400).json({ success: false, error: "No pending signup found. Please start over." });
    }

    const now = Date.now();
    if (now > pending.expiresAt) {
      clearPendingSignup(req);
      return res.status(400).json({ success: false, error: "OTP expired. Please request a new code." });
    }

    pending.attempts = (pending.attempts || 0) + 1;

    if (otp !== pending.otp) {
      return res.status(400).json({ success: false, error: "Incorrect OTP. Please try again." });
    }

    // OTP is correct - create the user
    const newuser = new User({ email: pending.email, username: pending.username });
    const registeredUser = await User.register(newuser, pending.password);

    // Clear pending data and log the user in
    clearPendingSignup(req);

    req.login(registeredUser, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: "Login failed after verification." });
      }
      res.status(201).json({ success: true, message: "Account created.", user: registeredUser });
    });
  } catch (e) {
    console.error("OTP verification error:", e);
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports.resendSignupOtp = async (req, res) => {
  try {
    const pending = req.session.pendingSignup;

    if (!pending) {
      return res.status(400).json({ success: false, error: "No pending signup found. Please sign up first." });
    }

    const otp = generateOtp();
    pending.otp = otp;
    pending.expiresAt = Date.now() + 60 * 1000;
    pending.attempts = 0;

    await sendOtpEmail(pending.email, otp);

    res.status(200).json({ success: true, message: "A new OTP was sent.", expiresIn: 60 });
  } catch (e) {
    console.error("Resend OTP error:", e);
    res.status(400).json({ success: false, error: e.message });
  }
};


module.exports.renderloginform = (req, res) => {
  // Only save referrer if there's no existing redirectUrl in session
  // (to prioritize protected route redirects over referrer)
  if (
    !req.session.redirectUrl &&
    req.get("Referrer") &&
    !req.get("Referrer").includes("/login")
  ) {
    req.session.redirectUrl = req.get("Referrer");
  }
  res.json({ success: true, message: "Render login form", redirectUrl: req.session.redirectUrl });
};



module.exports.login = async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    const { username } = req.body;
    let existingUser = null;
    if (username) {
      existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
    }

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
        redirectUrl: "/signup"
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "check your cridentials"
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        error: "your account is suspended"
      });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      
      let RedirectUrl = user.isAdmin ? "/admin-dashboard" : "/dashboard";
      if (res.locals.redirectUrl) {
        RedirectUrl = res.locals.redirectUrl;
      }
      
      const userPayload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        isSuspended: user.isSuspended || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
      };
      
      res.json({ success: true, message: "Welcome to HomiGo", RedirectUrl, user: userPayload });
    });
  })(req, res, next);
};


module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ success: true, message: "You are logged out!" });
  });
};

// Admin Controllers
module.exports.getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-salt -hash").sort({ createdAt: -1 });
  
  const usersWithCounts = await Promise.all(users.map(async (user) => {
    const listingsCount = await Listing.countDocuments({ owner: user._id });
    const bookingsCount = await Booking.countDocuments({ user: user._id });
    
    const userObj = user.toObject();
    if (!userObj.createdAt) {
      userObj.createdAt = user._id.getTimestamp();
    }
    
    return {
      ...userObj,
      listingsCount,
      bookingsCount
    };
  }));

  res.json({ success: true, users: usersWithCounts });
};

module.exports.toggleUserSuspension = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  if (user.isAdmin) {
    return res.status(403).json({ success: false, error: "Cannot suspend an admin" });
  }
  user.isSuspended = !user.isSuspended;
  await user.save();
  res.json({ success: true, message: `User ${user.isSuspended ? "suspended" : "activated"} successfully`, user });
};

module.exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Both current and new passwords are required." });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    await user.changePassword(oldPassword, newPassword);
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(400).json({ success: false, error: err.message || "Failed to change password." });
  }
};

module.exports.toggle2fa = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    res.json({ success: true, message: `Two-Factor Authentication ${user.twoFactorEnabled ? 'enabled' : 'disabled'} successfully.`, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    console.error("Toggle 2FA error:", err);
    res.status(500).json({ success: false, error: "Failed to toggle 2FA." });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { notifications, username } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    if (username) {
      user.username = username;
    }
    if (notifications !== undefined) {
      user.notifications = notifications;
    }
    await user.save();

    req.login(user, err => {
      if (err) return res.status(500).json({ success: false, error: "Failed to update session." });
      
      const userPayload = {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin || false,
        isSuspended: user.isSuspended || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        notifications: user.notifications || false
      };
      res.json({ success: true, message: "Profile updated successfully.", user: userPayload });
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, error: "Failed to update profile." });
  }
};
