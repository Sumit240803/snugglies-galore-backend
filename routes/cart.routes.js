const express = require('express');
const { getCart, addToCart, removeFromCart } = require("../controllers/cart.controller");
const  {protect}  = require("../middlewares/auth.middleware");
const cartRouter = express.Router();

/* ===========================
   USER CART ROUTES
=========================== */

/**
 * @route   GET /api/cart
 * @desc    Get logged-in user's cart
 * @access  Private
 */
cartRouter.get("/", protect, getCart);

/**
 * @route   POST /api/cart
 * @desc    Add product to cart
 * @access  Private
 */
cartRouter.post("/", protect, addToCart);

/**
 * @route   DELETE /api/cart
 * @desc    Remove product from cart
 * @access  Private
 */
cartRouter.delete("/", protect, removeFromCart);

module.exports = cartRouter;
