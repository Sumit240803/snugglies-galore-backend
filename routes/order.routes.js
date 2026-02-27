const express = require('express');
const { createOrder, getUserOrders, getOrderById, getAllOrders, updateOrderStatus, deleteOrder } = require("../controllers/order.controller");
const  {authorize}  = require("../middlewares/role.middleware");
const  {protect}  = require("../middlewares/auth.middleware");
const orderRouter = express.Router();

/* ===========================
   USER ROUTES
=========================== */

orderRouter.post("/", protect, createOrder);
orderRouter.get("/my", protect, getUserOrders);
orderRouter.get("/:id", protect, getOrderById);

/* ===========================
   ADMIN ROUTES
=========================== */

orderRouter.get("/", protect, authorize("admin"), getAllOrders);
orderRouter.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);
orderRouter.delete("/:id", protect, authorize("admin"), deleteOrder);
module.exports = orderRouter;