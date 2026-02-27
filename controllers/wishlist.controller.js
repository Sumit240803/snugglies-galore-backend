const mongoose = require("mongoose");
const WishlistItem = require("../models/wishlist.model");
const Product = require("../models/product.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
/* =====================================================
   GET USER WISHLIST
===================================================== */
 const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await WishlistItem.find({ user: req.user.id })
    .populate("product");

  res.json({
    total: wishlist.length,
    products: wishlist.map(item => item.product)
  });
});

/* =====================================================
   TOGGLE WISHLIST PRODUCT
===================================================== */
 const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId)
    throw new ApiError(400, "Product ID is required");

  const productExists = await Product.findById(productId);
  if (!productExists)
    throw new ApiError(404, "Product not found");

  const existingItem = await WishlistItem.findOne({
    user: req.user.id,
    product: productId
  });

  // If exists → remove
  if (existingItem) {
    await existingItem.deleteOne();

    return res.json({
      message: "Removed from wishlist",
      isWishlisted: false
    });
  }

  // Else → add
  await WishlistItem.create({
    user: req.user.id,
    product: productId
  });

  res.json({
    message: "Added to wishlist",
    isWishlisted: true
  });
});

/* =====================================================
   REMOVE PRODUCT FROM WISHLIST (Explicit)
===================================================== */
 const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const item = await WishlistItem.findOneAndDelete({
    user: req.user.id,
    product: productId
  });

  if (!item)
    throw new ApiError(404, "Item not found in wishlist");

  res.json({ message: "Removed successfully" });
});

/* =====================================================
   CLEAR WISHLIST
===================================================== */
 const clearWishlist = asyncHandler(async (req, res) => {
  await WishlistItem.deleteMany({ user: req.user.id });

  res.json({ message: "Wishlist cleared" });
});

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist
};