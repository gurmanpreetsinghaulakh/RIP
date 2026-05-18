if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ override: true });
}

// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const methodOverride = require('method-override');
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const reviewRouter = require("./routes/review.js");
const listingsRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

// Support multiple possible env names for flexibility (Render vs local)
let urldb = process.env.ALTLASDB_URL || process.env.ATLASDB_URL || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/homigo';
const redactedUri = urldb ? urldb.replace(/(mongodb(?:\+srv)?:\/\/[^:]+):[^@]+@/, '$1:<password>@') : 'MISSING';
console.log('DB URI (redacted):', redactedUri);

app.engine('ejs', ejsmate);

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

async function connectWithRetry(attempt = 1) {
    if (!urldb) {
        console.error('No MongoDB URI found in environment variables.');
        return;
    }
    try {
        await mongoose.connect(urldb, { serverSelectionTimeoutMS: 8000 });
        console.log('MongoDB connection established');
        await setupAdmin();
    } catch (err) {
        console.error(`MongoDB connect failed (attempt ${attempt}):`, err.code || err.message);
        if (attempt < 5) {
            const wait = attempt * 2000;
            console.log(`Retrying in ${wait}ms... Ensure Atlas allows this service's outbound IP (or temporarily whitelist 0.0.0.0/0).`);
            setTimeout(() => connectWithRetry(attempt + 1), wait);
        } else {
            console.error('All retry attempts exhausted.');
        }
    }
}

async function setupAdmin() {
    try {
        // Admin credentials can be configured via environment variables.
        // If you want to create/change the admin user, set these and restart the server.
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const adminUser = new User({
                email: adminEmail,
                username: adminUsername,
                isAdmin: true
            });
            await User.register(adminUser, adminPassword);
            console.log(`Admin account (${adminEmail}) successfully configured!`);
        } else {
            if (!existingAdmin.isAdmin) {
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log(`Existing user (${adminEmail}) upgraded to admin.`);
            } else {
                console.log("Admin account already exists.");
            }
        }
    } catch (e) {
        console.error("Error setting up admin account:", e);
    }
}

connectWithRetry();


const store = MongoStore.create({
    mongoUrl: urldb,
    crypto: {
        secret: process.env.SECRET || 'thisshouldbeabettersecret!'
    },

    touchAfter: 24 * 3600 // time period in seconds
});
store.on("error", function (e) {
    console.log("session store error", e);
});

//in milli seconds for one week;
const sessionoptions = {
    store,
    secret: process.env.SECRET || 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,

        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};



app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeuser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//    let registeredUser= await User.register(fakeuser,"helloworld");
//    res.send(registeredUser);
// })


// If a frontend build exists, serve it (supports deploying backend + frontend together).
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const shouldServeFrontend = process.env.SERVE_FRONTEND === "true" || process.env.NODE_ENV === "production";
const hasFrontendDist = fs.existsSync(frontendDistPath);
if (hasFrontendDist && shouldServeFrontend) {
    app.use(express.static(frontendDistPath));
}

// API routes (frontend expects /api/* endpoints)
app.use("/api/listings/:id/reviews", reviewRouter);
app.use("/api/listings", listingsRouter);
app.use("/api", userRouter);

// Serve React app for non-API routes when build is available
if (hasFrontendDist && shouldServeFrontend) {
    app.get('/', (req, res) => res.sendFile(path.join(frontendDistPath, "index.html")));
    app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) return next();
        return res.sendFile(path.join(frontendDistPath, "index.html"));
    });
} else {
    // When running locally with the React dev server, redirect the root URL
    // to the Vite app so you can see the UI without building.
    if (process.env.NODE_ENV !== "production") {
        app.get('/', (req, res) => res.redirect('http://localhost:5173'));
    } else {
        // If no frontend build is available in production, return a minimal JSON response.
        app.get('/', (req, res) => res.json({ success: true, message: "Welcome to HomiGo" }));
    }
}

app.get('/_health', (req, res) => res.send('ok'));

app.all("*", (req, res, next) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { StatusCode = 500, message } = err;
    console.log(err);

    res.status(StatusCode).json({ success: false, error: message, status: StatusCode });
});



const PORT = process.env.PORT || 4000; // Render supplies PORT
app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
    console.log(`Local listings URL: http://localhost:${PORT}`);
});