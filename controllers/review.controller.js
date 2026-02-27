const Review = require("../models/review.model");
const Product = require("../models/product.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
/* =====================================================
   HELPER: RECALCULATE PRODUCT RATING
===================================================== */
const updateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsCount: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0
    });
  }
};

/* =====================================================
   CREATE OR UPDATE REVIEW
===================================================== */
 const createOrUpdateReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!productId || rating === undefined)
    throw new ApiError(400, "Product and rating are required");

  if (rating < 1 || rating > 5)
    throw new ApiError(400, "Rating must be between 1 and 5");

  const productExists = await Product.findById(productId);
  if (!productExists) throw new ApiError(404, "Product not found");

  let review = await Review.findOne({ user: req.user.id, product: productId });

  if (review) {
    review.rating = rating;
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment
    });
  }

  await updateProductRatings(productId);

  res.status(201).json(review);
});

/* =====================================================
   GET REVIEWS FOR PRODUCT
===================================================== */
 const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.json({ total: reviews.length, reviews });
});

/* =====================================================
   GET SINGLE REVIEW
===================================================== */
 const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name")
    .populate("product", "name");

  if (!review) throw new ApiError(404, "Review not found");

  res.json(review);
});

/* =====================================================
   DELETE REVIEW
===================================================== */
 const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) throw new ApiError(404, "Review not found");

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    throw new ApiError(403, "Not authorized");
  }

  const productId = review.product;

  await review.deleteOne();

  await updateProductRatings(productId);

  res.json({ message: "Review deleted successfully" });
});

/* =====================================================
   GET RECENT REVIEWS (PUBLIC — across all products)
===================================================== */
const getRecentReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const reviews = await Review.find()
    .populate("user", "name")
    .populate("product", "name images")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ total: reviews.length, reviews });
});

module.exports = {
  createOrUpdateReview,
  getProductReviews,
  getReviewById,
  deleteReview,
  getRecentReviews
};