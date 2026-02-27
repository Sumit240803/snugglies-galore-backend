const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
 const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json(cart || { items: [] });
  } catch (err) {
    next(err);
  }
};

 const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity, variant }]
      });
    } else {
      const existingItem = cart.items.find(
        i =>
          i.product.toString() === productId &&
          i.variant?.size === variant?.size &&
          i.variant?.color === variant?.color
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, variant });
      }

      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

 const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(
      i => i.product.toString() !== productId
    );

    await cart.save();

    res.json(cart);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};