const { Router } = require("express");
const  authRouter  = require("./auth.routes");
const cartRouter  = require("./cart.routes");
const  couponRouter  = require("./coupon.routes");
const  orderRouter  = require("./order.routes");
const  productRouter  = require("./product.routes");
const  reviewRouter  = require("./review.routes");
const  userRouter  = require("./user.routes");
const  wishlistRouter  = require("./wishlist.routes");
const  adminRouter  = require("./admin.routes");

const router = Router();

router.use("/auth", authRouter);
router.use("/cart", cartRouter);
router.use("/coupons", couponRouter);
router.use("/orders", orderRouter);
router.use("/products", productRouter);
router.use("/reviews", reviewRouter);
router.use("/users", userRouter);
router.use("/wishlist", wishlistRouter);
router.use("/admin", adminRouter);

module.exports = router;
