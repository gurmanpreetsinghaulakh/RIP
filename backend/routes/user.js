const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, isAdmin } = require("../middleware.js");
const usercontroller = require("../controllers/user.js");
const listingcontroller = require("../controllers/listings.js");



router.route("/signup")
  .get(usercontroller.rendersignupform)
  .post(wrapAsync(usercontroller.signup));

router.post("/signup/verify", wrapAsync(usercontroller.verifySignupOtp));
router.post("/signup/resend", wrapAsync(usercontroller.resendSignupOtp));

router.route("/login")
  .get(usercontroller.renderloginform)
  .post(saveRedirectUrl, wrapAsync(usercontroller.login));

router.post("/login/verify-otp", wrapAsync(usercontroller.verifyLoginOtp));
router.post("/login/resend-otp", wrapAsync(usercontroller.resendLoginOtp));

//logout  
router.get("/logout", usercontroller.logout);

// User specific data
router.get("/user/bookings", isLoggedIn, wrapAsync(listingcontroller.getMyBookings));
router.get("/user/wishlist", isLoggedIn, wrapAsync(usercontroller.getWishlist));
router.post("/user/wishlist/:listingId", isLoggedIn, wrapAsync(usercontroller.toggleWishlist));
router.get("/user/reviews", isLoggedIn, wrapAsync(usercontroller.getUserReviews));

// Admin routes
router.get("/admin/users", isLoggedIn, isAdmin, wrapAsync(usercontroller.getAllUsers));
router.patch("/admin/users/:id/suspend", isLoggedIn, isAdmin, wrapAsync(usercontroller.toggleUserSuspension));

// Security & Auth routes
router.post("/user/change-password", isLoggedIn, wrapAsync(usercontroller.changePassword));
router.post("/user/toggle-2fa", isLoggedIn, wrapAsync(usercontroller.toggle2fa));
router.post("/user/profile", isLoggedIn, wrapAsync(usercontroller.updateProfile));
router.delete("/user/account", isLoggedIn, wrapAsync(usercontroller.deleteAccount));

module.exports = router;
