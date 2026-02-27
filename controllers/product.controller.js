const slugify = require("slugify");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
/* =====================================================
   CREATE PRODUCT (ADMIN)
===================================================== */
 const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const {
    name,
    description,
    category,
    basePrice,
    images,
    variants,
    isFeatured,
    isActive
  } = req.body;

  if (!name || !description || !category || !basePrice)
    throw new ApiError(400, "Missing required fields");

  const categoryExists = await Category.findById(category);
  if (!categoryExists)
    throw new ApiError(404, "Category not found");

  const slug = slugify(name, { lower: true, strict: true });

  const existingSlug = await Product.findOne({ slug });
  if (existingSlug)
    throw new ApiError(400, "Product with similar name already exists");

  let totalStock = 0;
  if (variants?.length) {
    totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }

  const product = await Product.create({
    name,
    slug,
    description,
    category,
    basePrice,
    images: images || [],
    variants: variants || [],
    totalStock,
    isFeatured: isFeatured || false,
    isActive: isActive !== undefined ? isActive : true
  });

  res.status(201).json(product);
});

/* =====================================================
   GET ALL PRODUCTS
===================================================== */
 const getAllProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const { category, search, isActive } = req.query;

  const query = {};

  if (category) query.category = category;
  if (isActive !== undefined)
    query.isActive = isActive === "true";
  if (req.query.isFeatured !== undefined)
    query.isFeatured = req.query.isFeatured === "true";

  if (search)
    query.$text = { $search: search };

  const products = await Product.find(query)
    .populate("category")
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    products
  });
});

/* =====================================================
   GET SINGLE PRODUCT (BY ID)
===================================================== */
 const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category");

  if (!product)
    throw new ApiError(404, "Product not found");

  res.json(product);
});

/* =====================================================
   GET PRODUCT BY SLUG
===================================================== */
 const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category");

  if (!product)
    throw new ApiError(404, "Product not found");

  res.json(product);
});

/* =====================================================
   UPDATE PRODUCT (ADMIN)
===================================================== */
 const updateProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const product = await Product.findById(req.params.id);
  if (!product)
    throw new ApiError(404, "Product not found");

  const {
    name,
    description,
    category,
    basePrice,
    images,
    variants,
    isFeatured,
    isActive
  } = req.body;

  if (name) {
    product.name = name;
    product.slug = slugify(name, { lower: true, strict: true });
  }

  if (description) product.description = description;
  if (category) product.category = category;
  if (basePrice) product.basePrice = basePrice;
  if (images) product.images = images;
  if (variants) {
    product.variants = variants;
    product.totalStock = variants.reduce(
      (sum, v) => sum + (v.stock || 0),
      0
    );
  }

  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  res.json(product);
});

/* =====================================================
   GET ALL CATEGORIES (PUBLIC)
===================================================== */
 const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ categories });
});

/* =====================================================
   DELETE PRODUCT (ADMIN)
===================================================== */
 const deleteProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const product = await Product.findById(req.params.id);
  if (!product)
    throw new ApiError(404, "Product not found");

  await product.deleteOne();

  res.json({ message: "Product deleted successfully" });
});

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getCategories
};
