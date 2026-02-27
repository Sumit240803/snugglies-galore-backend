const mongoose = require("mongoose");
const addressSchema = require("./address.model");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [addressSchema],
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, select: false }
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
