const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    description: String,

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },

    discountValue: {
      type: Number,
      required: true
    },

    minOrderAmount: {
      type: Number,
      default: 0
    },

    maxDiscountAmount: {
      type: Number // Useful for percentage cap
    },

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],

    usageLimit: {
      type: Number, // total global usage
      default: null
    },

    usedCount: {
      type: Number,
      default: 0
    },

    usagePerUser: {
      type: Number,
      default: 1
    },

    validFrom: {
      type: Date,
      default: Date.now
    },

    validUntil: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);


couponSchema.index({ validUntil: 1 });
module.exports = mongoose.model("Coupon", couponSchema);