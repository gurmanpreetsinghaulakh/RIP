const Review = require("../models/review.js");
const listing = require("../models/listing.js");

module.exports.addnewreview = async (req, res, next) => {
  const listings = await listing.findById(req.params.id);
  if (!listings) {
    return res.status(404).json({ success: false, error: "Listing not found" });
  }

  const existingReview = await Review.findOne({ author: req.user._id, listing: req.params.id });
  if (existingReview) {
    return res.status(400).json({ success: false, error: "You have already reviewed this property. Please edit your review instead." });
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  newReview.listing = listings._id;

  listings.reviews.push(newReview);
  await newReview.save();
  await listings.save();
  res.status(201).json({ success: true, message: "New Review Added !!!", review: newReview });
};

module.exports.editReview = async (req, res, next) => {
  const { reviewid } = req.params;
  const review = await Review.findById(reviewid);
  if (!review) {
    return res.status(404).json({ success: false, error: "Review not found" });
  }

  if (!req.user.isAdmin && !review.author.equals(req.user._id)) {
    return res.status(403).json({ success: false, error: "You are not authorized to edit this review" });
  }

  review.comment = req.body.review.comment;
  review.rating = req.body.review.rating;
  await review.save();

  res.json({ success: true, message: "Review updated successfully", review });
};

module.exports.deleteroute = async (req, res) => {
  let { id, reviewid } = req.params;
  await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  res.json({ success: true, message: "Review Deleted !!!" });
};