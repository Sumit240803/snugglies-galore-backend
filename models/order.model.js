const mongoose = require("mongoose");
const addressSchema = require("./address.model")
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    variant: {
      size: String,
      color: String
    },
    price: Number,
    quantity: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [orderItemSchema],
    shippingAddress: addressSchema,
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "razorpay"]
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing"
    },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);