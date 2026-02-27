const express = require('express');
const { getProfile, updateProfile, changePassword, addAddress, updateAddress, removeAddress, getAllUsers, getUserById, deleteUser } = require("../controllers/user.controller");
const  {authorize}  = require("../middlewares/role.middleware");
const  {protect}  = require("../middlewares/auth.middleware");
const userRouter = express.Router();

/* ===========================
   USER ROUTES
=========================== */

userRouter.get("/me", protect, getProfile);
userRouter.put("/me", protect, updateProfile);
userRouter.put("/change-password", protect, changePassword);

userRouter.post("/address", protect, addAddress);
userRouter.put("/address/:index", protect, updateAddress);
userRouter.delete("/address/:index", protect, removeAddress);

/* ===========================
   ADMIN ROUTES
=========================== */

userRouter.get("/", protect, authorize("admin"), getAllUsers);
userRouter.get("/:id", protect, authorize("admin"), getUserById);
userRouter.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = userRouter;