const mongoose = require("mongoose");
const listing = require("../models/listing");
const Booking = require("../models/booking");
const { sendBookingConfirmationEmail } = require("./user.js");

const DEFAULT_TOTAL_ROOMS = 20;

const toDateKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }
  if (typeof value !== 'string') return null;
  const rawDate = value.split('T')[0];
  const [year, month, day] = rawDate.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const getDatesInRange = (checkIn, checkOut) => {
  const start = parseDateOnly(checkIn);
  const end = parseDateOnly(checkOut);
  if (!start || !end || start >= end) return [];
  const dates = [];
  const current = new Date(start);
  while (current < end) {
    dates.push(toDateKey(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
};

const getAvailabilityByRange = async (listingId, checkIn, checkOut, session = null) => {
  const startDate = parseDateOnly(checkIn);
  const endDate = parseDateOnly(checkOut);

  if (!startDate || !endDate) {
    throw new Error('Invalid check-in or check-out date');
  }
  if (startDate >= endDate) {
    throw new Error('Check-out must be after check-in');
  }

  const listingObjQuery = listing.findById(listingId);
  if (session) listingObjQuery.session(session);
  const listingObj = await listingObjQuery;
  if (!listingObj) {
    const err = new Error('Listing not found');
    err.status = 404;
    throw err;
  }

  const totalRooms = listingObj.totalRooms || DEFAULT_TOTAL_ROOMS;

  const bookingQuery = Booking.find({
    listing: listingId,
    status: { $ne: 'cancelled' },
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate }
  });
  if (session) bookingQuery.session(session);
  const overlappingBookings = await bookingQuery;

  const dateAvailability = {};
  let minAvailable = totalRooms;
  const dateKeys = getDatesInRange(startDate, endDate);

  for (const dateKey of dateKeys) {
    const currentDate = parseDateOnly(dateKey);
    let bookedRooms = 0;

    for (const booking of overlappingBookings) {
      const bookingStart = parseDateOnly(booking.checkIn);
      const bookingEnd = parseDateOnly(booking.checkOut);
      if (bookingStart <= currentDate && currentDate < bookingEnd) {
        bookedRooms += booking.rooms || 1;
      }
    }

    const availableRooms = Math.max(0, totalRooms - bookedRooms);
    dateAvailability[dateKey] = {
      bookedRooms,
      availableRooms,
      isFullyBooked: availableRooms <= 0
    };
    minAvailable = Math.min(minAvailable, availableRooms);
  }

  return {
    totalRooms,
    dateAvailability,
    availableRooms: minAvailable,
    available: minAvailable > 0
  };
};

module.exports.index = async (req, res) => {
  const listings = await listing.find({});
  res.json({ success: true, listings });
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ success: false, error: "Please enter a search term" });
  }

  // Search in title, location, country, and description using case-insensitive regex
  const listings = await listing.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { country: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  });

  if (listings.length === 0) {
    return res.json({ success: true, listings: [], message: `No listings found for "${q}"` });
  }

  res.json({ success: true, listings });
};

module.exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }

  try {
    const query = q.trim();

    // Search for listings matching the query
    const listings = await listing.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);

    // Extract unique suggestions from titles, locations, and countries
    const suggestions = new Set();

    listings.forEach(list => {
      if (list.title) suggestions.add(list.title);
      if (list.location) suggestions.add(list.location);
      if (list.country) suggestions.add(list.country);
    });

    // Return as array, limited to 5 suggestions
    const result = Array.from(suggestions).slice(0, 5);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
};

module.exports.filterListings = async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ success: false, error: "Category not provided" });
  }

  const normalizedCategory = category.trim();
  const exactCategories = new Set(["Beach", "Mountain", "City", "Heritage", "Forest", "Farm", "Desert", "Arctic", "Pools", "Stay"]);

  let listings;
  if (normalizedCategory === 'All' || normalizedCategory === 'Rooms') {
    listings = await listing.find({});
  } else if (normalizedCategory === 'Trending') {
    listings = await listing.find({}).sort({ availableRooms: -1, price: 1 }).limit(40);
  } else if (exactCategories.has(normalizedCategory)) {
    listings = await listing.find({ category: normalizedCategory });
  } else {
    listings = await listing.find({ category: normalizedCategory });
  }

  if (listings.length === 0) {
    return res.json({ success: true, listings: [], message: `No listings found in ${category} category` });
  }

  res.json({ success: true, listings, selectedCategory: category });
};

module.exports.rendernewform = (req, res) => { res.json({ success: true, message: "Render new form" }); };

module.exports.showlisting = async (req, res) => {
  let { id } = req.params;
  const listings = await listing
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listings) {
    return res.status(404).json({ success: false, error: "Listing you requested for does not exist" });
  }
  //   console.log("listings", listings);
  res.json({ success: true, listings });
};

module.exports.createroute = async (req, res, next) => {
  const newlisting = new listing(req.body.listing);
  newlisting.owner = req.user._id;

  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.map(f => ({
      url: f.path && f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`,
      filename: f.filename
    }));
    newlisting.Image = uploadedImages[0];
    newlisting.images = uploadedImages;
  } else if (req.file) {
    const filename = req.file.filename;
    const url = req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${filename}`;
    newlisting.Image = { url, filename };
    newlisting.images = [{ url, filename }];
  } else {
    return res.status(400).json({ success: false, error: "At least 1 image is required" });
  }

  // Set default geometry since it's required by the model
  newlisting.geometry = {
    type: "Point",
    coordinates: [0, 0] // Default fallback or use location data if available.
  };

  try {
    const savedlis = await newlisting.save();
    res.status(201).json({ success: true, message: "New Listing Created !!!", listing: savedlis });
  } catch (err) {
    console.error("Save listing error:", err);
    res.status(500).json({ success: false, error: "Database error while saving listing" });
  }
};

module.exports.renderEditroute = async (req, res) => {
  let { id } = req.params;
  const listings = await listing.findById(id);
  if (!listings) {
    return res.status(404).json({ success: false, error: "Listing you requested for does not exist" });
  }
  let originalImageUrl = listings.Image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250")
  res.json({ success: true, listings, originalImageUrl });
};

module.exports.updateroute = async (req, res) => {
  let { id } = req.params;
  
  // Update the basic fields first and get the refreshed document
  let Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true, runValidators: true });
  
  if (!Listing) {
    return res.status(404).json({ success: false, error: "Listing not found" });
  }

  // Handle multiple file uploads if present
  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.map(f => ({
      url: f.path && f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`,
      filename: f.filename
    }));
    
    Listing.Image = uploadedImages[0];
    Listing.images = uploadedImages;
    await Listing.save();
  } 
  // Handle single file upload if present (though route mostly uses .array now)
  else if (req.file) {
    const filename = req.file.filename;
    const url = req.file.path && req.file.path.startsWith('http') ? req.file.path : `/uploads/${filename}`;
    
    Listing.Image = { url, filename };
    Listing.images = [{ url, filename }];
    await Listing.save();
  }

  res.json({ success: true, message: "Listing Updated Successfully!", listing: Listing });
};

module.exports.deleteroute = async (req, res) => {
  let { id } = req.params;

  let deleted = await listing.findByIdAndDelete(id);
  console.log(deleted);
  res.json({ success: true, message: "Listing Deleted !!!", deleted });
};

module.exports.bookListing = async (req, res) => {
  const { id } = req.params;
  const { nights, amount, checkIn, checkOut, rooms = 1 } = req.body;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ success: false, error: 'Please provide check-in and check-out dates' });
  }

  const checkInDate = parseDateOnly(checkIn);
  const checkOutDate = parseDateOnly(checkOut);

  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({ success: false, error: 'Invalid check-in or check-out date' });
  }

  if (checkInDate >= checkOutDate) {
    return res.status(400).json({ success: false, error: 'Check-out must be after check-in' });
  }

  const listingToBook = await listing.findById(id);
  if (!listingToBook) {
    return res.status(404).json({ success: false, error: 'Listing not found' });
  }

  const nightsCount = nights || Math.max(1, Math.round((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000)));
  const totalRooms = listingToBook.totalRooms || DEFAULT_TOTAL_ROOMS;

  const availability = await getAvailabilityByRange(id, checkInDate, checkOutDate);
  if (!availability.available) {
    return res.status(400).json({ success: false, error: 'Selected dates are fully booked' });
  }

  if (availability.availableRooms < rooms) {
    return res.status(400).json({ success: false, error: `Only ${availability.availableRooms} room(s) available for selected dates` });
  }

  let session;
  try {
    session = await mongoose.startSession();
    let useTransaction = true;
    try {
      session.startTransaction();
    } catch (startErr) {
      useTransaction = false;
    }

    const availabilityDuringBooking = useTransaction
      ? await getAvailabilityByRange(id, checkInDate, checkOutDate, session)
      : await getAvailabilityByRange(id, checkInDate, checkOutDate);

    if (availabilityDuringBooking.availableRooms < rooms) {
      if (useTransaction && session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ success: false, error: `Only ${availabilityDuringBooking.availableRooms} room(s) available for selected dates` });
    }

    const newBooking = new Booking({
      listing: listingToBook._id,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: nightsCount,
      rooms: rooms,
      amount: amount || (listingToBook.price * nightsCount * rooms),
      status: 'confirmed'
    });

    if (useTransaction) {
      await newBooking.save({ session });
      await session.commitTransaction();
    } else {
      await newBooking.save();
    }

    try {
      await sendBookingConfirmationEmail(
        req.user.email,
        req.user.username || req.user.email,
        newBooking,
        listingToBook
      );
    } catch (emailError) {
      console.error('Booking confirmation email error:', emailError);
    }

    res.json({ success: true, message: 'Booking successful', booking: newBooking });
  } catch (err) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Booking error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Booking failed' });
  } finally {
    if (session) session.endSession();
  }
};

module.exports.checkAvailability = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ success: false, error: 'Please provide check-in and check-out dates' });
  }

  try {
    const availability = await getAvailabilityByRange(id, checkIn, checkOut);
    return res.json({ success: true, ...availability });
  } catch (err) {
    console.error('Availability error:', err);
    return res.status(err.status || 400).json({ success: false, error: err.message });
  }
};

module.exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('listing')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, bookings });
};

module.exports.getAllBookings = async (req, res) => {
  const bookings = await Booking.find({})
    .populate('listing')
    .populate('user')
    .sort({ createdAt: -1 });
  
  res.json({ success: true, bookings });
};

module.exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  
  if (!updatedBooking) {
    return res.status(404).json({ success: false, error: "Booking not found" });
  }
  
  res.json({ success: true, booking: updatedBooking });
};
