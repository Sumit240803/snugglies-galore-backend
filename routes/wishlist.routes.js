const express = require('express');
const { getWishlist, toggleWishlist, removeFromWishlist, clearWishlist,  } = require("../controllers/wishlist.controller");
const { protect } = require('../middlewares/auth.middleware');

const wishlistRouter = express.Router();

/* ===========================
   USER WISHLIST ROUTES
=========================== */

wishlistRouter.get("/", protect, getWishlist);

wishlistRouter.post("/toggle", protect, toggleWishlist);

wishlistRouter.delete("/:productId", protect, removeFromWishlist);

wishlistRouter.delete("/", protect, clearWishlist);
module.exports = wishlistRouter;