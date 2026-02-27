const express = require("express");
const {
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const adminRouter = express.Router();

// All admin routes require authentication + admin role
adminRouter.use(protect, authorize("admin"));

/* ===========================
   DASHBOARD
=========================== */
// GET /admin/stats  — summary stats for the dashboard
adminRouter.get("/stats", getDashboardStats);

/* ===========================
   ANALYTICS
=========================== */
// GET /admin/analytics  — weekly revenue, category breakdown, metrics
adminRouter.get("/analytics", getAnalytics);

/* ===========================
   SETTINGS
=========================== */
// GET  /admin/settings  — get store settings
// PUT  /admin/settings  — update store settings
adminRouter.get("/settings", getSettings);
adminRouter.put("/settings", updateSettings);

module.exports = adminRouter;
