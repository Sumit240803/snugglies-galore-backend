const express = require('express');
const { getAllProducts, getProductBySlug, getSingleProduct, createProduct, updateProduct, deleteProduct, getCategories } = require("../controllers/product.controller");
const  {authorize}  = require("../middlewares/role.middleware");
const  {protect}  = require("../middlewares/auth.middleware");
const productRouter = express.Router();

/* ===========================
   PUBLIC ROUTES
=========================== */

productRouter.get("/", getAllProducts);
productRouter.get("/categories", getCategories);
productRouter.get("/slug/:slug", getProductBySlug);
productRouter.get("/:id", getSingleProduct);

/* ===========================
   ADMIN ROUTES
=========================== */

productRouter.post("/", protect, authorize("admin"), createProduct);
productRouter.put("/:id", protect, authorize("admin"), updateProduct);
productRouter.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = productRouter;