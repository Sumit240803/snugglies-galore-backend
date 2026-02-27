const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "Snugglies Galore" },
    contactEmail: { type: String, default: "hello@snuggliesgalore.com" },
    phone: { type: String, default: "" },
    notifications: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      customerReviews: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
