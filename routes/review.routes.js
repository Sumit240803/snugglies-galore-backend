const express = require('express');
const { createOrUpdateReview, getProductReviews, getReviewById, deleteReview, getRecentReviews } = require("../controllers/review.controller");
const  {authorize}  = require("../middlewares/role.middleware");
const  {protect}  = require("../middlewares/auth.middleware");
const reviewRouter = express.Router();

// Create or update a review for a product (protected)
reviewRouter.post("/", protect, createOrUpdateReview);

// Get recent reviews across all products (public)
reviewRouter.get("/recent", getRecentReviews);

// Get all reviews for a product (public)
reviewRouter.get("/product/:productId", getProductReviews);

// Get single review by id (public)
reviewRouter.get("/:id", getReviewById);

// Delete review (protected — owner or admin)
reviewRouter.delete("/:id", protect, deleteReview);

module.exports = reviewRouter;