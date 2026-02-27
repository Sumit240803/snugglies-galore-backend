const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
const Coupon = require("../models/coupons.model");
/* =====================================================
   CREATE ORDER
===================================================== */
 const createOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0)
      throw new ApiError(400, "Cart is empty");

    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (item.variant?.size || item.variant?.color) {
        const variant = product.variants.find(
          v =>
            v.size === item.variant.size &&
            v.color === item.variant.color
        );

        if (!variant || variant.stock < item.quantity)
          throw new ApiError(400, "Insufficient variant stock");

        variant.stock -= item.quantity;
      } else {
        if (product.totalStock < item.quantity)
          throw new ApiError(400, "Insufficient stock");

        product.totalStock -= item.quantity;
      }

      await product.save({ session });

      totalAmount += product.basePrice * item.quantity;
    }

    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode }).session(session);

      if (!coupon || !coupon.isActive)
        throw new ApiError(400, "Invalid coupon");

      discount =
        coupon.discountType === "percentage"
          ? (totalAmount * coupon.discountValue) / 100
          : coupon.discountValue;

      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    const finalAmount = Math.max(totalAmount - discount, 0);

    const order = await Order.create(
      [
        {
          user: req.user.id,
          items: cart.items,
          shippingAddress,
          paymentMethod,
          totalAmount: finalAmount
        }
      ],
      { session }
    );

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

/* =====================================================
   USER ORDERS
===================================================== */
 const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json(orders);
});

 const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product");

  if (!order)
    throw new ApiError(404, "Order not found");

  if (order.user.toString() !== req.user.id && req.user.role !== "admin")
    throw new ApiError(403, "Not authorized");

  res.json(order);
});

/* =====================================================
   ADMIN CONTROLLERS
===================================================== */

 const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  res.json({
    page,
    totalPages: Math.ceil(total / limit),
    totalOrders: total,
    results: orders
  });
});

 const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled"
  ];

  if (!validStatuses.includes(status))
    throw new ApiError(400, "Invalid order status");

  const order = await Order.findById(req.params.id)
    .populate("items.product");

  if (!order)
    throw new ApiError(404, "Order not found");

  // Restock inventory if cancelled
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      const product = item.product;

      if (item.variant?.size || item.variant?.color) {
        const variant = product.variants.find(
          v =>
            v.size === item.variant.size &&
            v.color === item.variant.color
        );
        if (variant) variant.stock += item.quantity;
      } else {
        product.totalStock += item.quantity;
      }

      await product.save();
    }
  }

  order.status = status;
  await order.save();

  res.json(order);
});

 const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    throw new ApiError(404, "Order not found");

  await order.deleteOne();

  res.json({ message: "Order deleted successfully" });
});

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
};