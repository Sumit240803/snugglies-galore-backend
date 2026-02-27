const Coupon = require("../models/coupons.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
/* ================================
   CREATE COUPON (Admin Only)
================================ */

 const createCoupon = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    applicableProducts,
    applicableCategories,
    usageLimit,
    usagePerUser,
    validFrom,
    validUntil,
    isActive
  } = req.body;

  if (!code || !discountType || !discountValue || !validUntil)
    throw new ApiError(400, "Missing required fields");

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing)
    throw new ApiError(400, "Coupon code already exists");

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscountAmount,
    applicableProducts,
    applicableCategories,
    usageLimit,
    usagePerUser,
    validFrom,
    validUntil,
    isActive
  });

  res.status(201).json(coupon);
});

/* ================================
   GET ALL COUPONS (Admin)
================================ */

 const getAllCoupons = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const { page = 1, limit = 10, isActive } = req.query;

  const query = {};
  if (isActive !== undefined) query.isActive = isActive;

  const coupons = await Coupon.find(query)
    .populate("applicableProducts applicableCategories")
    .limit(Math.min(Number(limit), 50))
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Coupon.countDocuments(query);

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    coupons
  });
});

/* ================================
   GET SINGLE COUPON
================================ */

 const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate("applicableProducts applicableCategories");

  if (!coupon)
    throw new ApiError(404, "Coupon not found");

  res.json(coupon);
});

/* ================================
   UPDATE COUPON (Admin)
================================ */

 const updateCoupon = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon)
    throw new ApiError(404, "Coupon not found");

  const updatableFields = [
    "description",
    "discountType",
    "discountValue",
    "minOrderAmount",
    "maxDiscountAmount",
    "applicableProducts",
    "applicableCategories",
    "usageLimit",
    "usagePerUser",
    "validFrom",
    "validUntil",
    "isActive"
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  await coupon.save();

  res.json(coupon);
});

/* ================================
   DELETE COUPON (Soft Delete)
================================ */

 const deleteCoupon = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const coupon = await Coupon.findById(req.params.id);

  if (!coupon)
    throw new ApiError(404, "Coupon not found");

  coupon.isActive = false;
  await coupon.save();

  res.json({ message: "Coupon deactivated successfully" });
});

/* ================================
   VALIDATE COUPON (Customer)
================================ */

 const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code)
    throw new ApiError(400, "Coupon code required");

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon || !coupon.isActive)
    throw new ApiError(400, "Invalid coupon");

  const now = new Date();

  if (coupon.validFrom > now || coupon.validUntil < now)
    throw new ApiError(400, "Coupon expired");

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    throw new ApiError(400, "Coupon usage limit reached");

  if (cartTotal < coupon.minOrderAmount)
    throw new ApiError(400, "Minimum order amount not met");

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (cartTotal * coupon.discountValue) / 100;

    if (coupon.maxDiscountAmount)
      discount = Math.min(discount, coupon.maxDiscountAmount);
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    couponId: coupon._id,
    discount,
    finalAmount: Math.max(cartTotal - discount, 0)
  });
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon
};