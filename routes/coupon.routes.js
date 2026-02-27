const express = require('express');
const { createCoupon, getAllCoupons, getCouponById, updateCoupon, deleteCoupon, validateCoupon } = require("../controllers/coupon.controller");
const  {protect}  = require("../middlewares/auth.middleware");
const  {authorize}  = require("../middlewares/role.middleware");
const couponRouter = express.Router();

/* ===========================
   PUBLIC ROUTES
=========================== */

/**
 * @route   POST /api/coupons/validate
 * @desc    Validate coupon for cart
 * @access  Protected (customer)
 */
couponRouter.post("/validate", protect, authorize("customer"), validateCoupon);


/* ===========================
   ADMIN ROUTES
=========================== */

/**
 * @route   POST /api/coupons
 * @desc    Create new coupon
 * @access  Admin
 */
couponRouter.post("/", protect, authorize("admin"), createCoupon);

/**
 * @route   GET /api/coupons
 * @desc    Get all coupons (paginated)
 * @access  Admin
 */
couponRouter.get("/", protect, authorize("admin"), getAllCoupons);

/**
 * @route   GET /api/coupons/:id
 * @desc    Get single coupon
 * @access  Admin
 */
couponRouter.get("/:id", protect, authorize("admin"), getCouponById);

/**
 * @route   PUT /api/coupons/:id
 * @desc    Update coupon
 * @access  Admin
 */
couponRouter.put("/:id", protect, authorize("admin"), updateCoupon);

/**
 * @route   DELETE /api/coupons/:id
 * @desc    Soft delete coupon
 * @access  Admin
 */
couponRouter.delete("/:id", protect, authorize("admin"), deleteCoupon);
module.exports = couponRouter;