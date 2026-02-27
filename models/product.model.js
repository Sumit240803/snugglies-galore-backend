const mongoose = require("mongoose");
const productVariantSchema = new mongoose.Schema(
  {
    size: String,
    color: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },

  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    basePrice: { type: Number, required: true },
    images: [{ type: String }],
    variants: [productVariantSchema],
    totalStock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", productSchema);