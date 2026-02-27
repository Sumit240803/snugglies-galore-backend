const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Wishlist = require("../models/wishlist.model");
const Settings = require("../models/settings.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");

/* =====================================================
   DASHBOARD STATS
   GET /admin/stats
===================================================== */
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Parallel aggregation
  const [
    totalRevenue,
    lastMonthRevenue,
    totalOrders,
    lastMonthOrders,
    totalProducts,
    totalCustomers,
    lastMonthCustomers,
    recentOrders,
    topProducts
  ] = await Promise.all([
    // Total revenue (all time, non-cancelled orders)
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),

    // Last month revenue
    Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),

    // Total orders this month
    Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

    // Total orders last month
    Order.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    }),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Total customers (non-admin users)
    User.countDocuments({ role: "customer" }),

    // New customers last month
    User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    }),

    // Recent 5 orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("_id user items totalAmount orderStatus paymentStatus createdAt"),

    // Top 5 products by total quantity sold
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 5 }
    ])
  ]);

  const thisMonthRevenue = totalRevenue[0]?.total || 0;
  const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueChange = prevMonthRevenue
    ? (((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
    : null;

  const orderChange = lastMonthOrders
    ? (((totalOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
    : null;

  res.json({
    stats: {
      totalRevenue: thisMonthRevenue,
      revenueChange,
      totalOrders,
      orderChange,
      totalProducts,
      totalCustomers,
      newCustomers: lastMonthCustomers
    },
    recentOrders,
    topProducts
  });
});

/* =====================================================
   ANALYTICS
   GET /admin/analytics
===================================================== */
const getAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();

  // Last 7 days range
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Last 30 days for avg order value
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [weeklyData, categoryRevenue, avgOrderData, wishlistCount] = await Promise.all([
    // Daily orders & revenue for last 7 days
    Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Revenue by category (via product lookup)
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData"
        }
      },
      { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData"
        }
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$categoryData.name",
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] }
          }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Avg order value over last 30 days
    Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: "cancelled" },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$totalAmount" },
          count: { $sum: 1 },
          total: { $sum: "$totalAmount" }
        }
      }
    ]),

    // Total wishlist items (proxy for wishlist adds)
    Wishlist.countDocuments()
  ]);

  // Build full 7-day array (fill in zeros for missing days)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const found = weeklyData.find((x) => x._id === key);
    days.push({
      day: dayNames[d.getDay()],
      date: key,
      orders: found?.orders || 0,
      revenue: found?.revenue || 0
    });
  }

  // Calculate category percentages
  const totalCategoryRevenue = categoryRevenue.reduce(
    (sum, c) => sum + c.revenue,
    0
  );
  const categoryBreakdown = categoryRevenue.map((c) => ({
    name: c._id || "Unknown",
    revenue: c.revenue,
    percentage:
      totalCategoryRevenue > 0
        ? Math.round((c.revenue / totalCategoryRevenue) * 100)
        : 0
  }));

  const avgOrder = avgOrderData[0] || { avg: 0, count: 0, total: 0 };
  const wishlistTotal = wishlistCount || 0;

  res.json({
    weeklyData: days,
    categoryBreakdown,
    metrics: {
      avgOrderValue: Math.round(avgOrder.avg || 0),
      ordersLast30Days: avgOrder.count,
      totalRevenueLast30Days: avgOrder.total,
      wishlistItems: wishlistTotal
    }
  });
});

/* =====================================================
   GET SETTINGS
   GET /admin/settings
===================================================== */
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  // Create default settings if none exist
  if (!settings) {
    settings = await Settings.create({});
  }

  res.json(settings);
});

/* =====================================================
   UPDATE SETTINGS
   PUT /admin/settings
===================================================== */
const updateSettings = asyncHandler(async (req, res) => {
  const { storeName, contactEmail, phone, notifications } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({});
  }

  if (storeName !== undefined) settings.storeName = storeName;
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (phone !== undefined) settings.phone = phone;
  if (notifications) {
    if (notifications.newOrder !== undefined)
      settings.notifications.newOrder = notifications.newOrder;
    if (notifications.lowStock !== undefined)
      settings.notifications.lowStock = notifications.lowStock;
    if (notifications.customerReviews !== undefined)
      settings.notifications.customerReviews = notifications.customerReviews;
  }

  await settings.save();

  res.json({ message: "Settings updated", settings });
});

module.exports = {
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings
};
