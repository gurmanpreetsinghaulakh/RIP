const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin, validateListing, isOwner } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer = require('multer')
const { storage } = require("../cloudComfig.js")
const upload = multer({ storage });


router.route("/")
    .get(wrapAsync(listingcontroller.index))
    .post(isLoggedIn, isAdmin, upload.array('listing[Image]', 3), validateListing, wrapAsync(listingcontroller.createroute));

//search route
router.get("/search", wrapAsync(listingcontroller.searchListings));

//suggestions route
router.get("/suggestions", wrapAsync(listingcontroller.getSuggestions));

//filter route
router.get("/filter", isLoggedIn, wrapAsync(listingcontroller.filterListings));

//new route
router.get("/new", isLoggedIn, isAdmin, listingcontroller.rendernewform);


// Admin Booking Routes
router.get("/admin/bookings", isLoggedIn, isAdmin, wrapAsync(listingcontroller.getAllBookings));
router.patch("/admin/bookings/:id", isLoggedIn, isAdmin, wrapAsync(listingcontroller.updateBookingStatus));


router.route("/:id")
    .get(isLoggedIn, wrapAsync(listingcontroller.showlisting))
    .put(isLoggedIn, isAdmin, isOwner, upload.array('listing[Image]', 3), validateListing, wrapAsync(listingcontroller.updateroute))
    .delete(isLoggedIn, isAdmin, isOwner, wrapAsync(listingcontroller.deleteroute));

// check availability route
router.get("/:id/availability", wrapAsync(listingcontroller.checkAvailability));

// book route
router.post("/:id/book", isLoggedIn, wrapAsync(listingcontroller.bookListing));


//edit route
router.get("/:id/edit", isLoggedIn, isAdmin, isOwner, wrapAsync(listingcontroller.renderEditroute));


module.exports = router;
