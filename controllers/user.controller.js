const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
/* =====================================================
   GET CURRENT USER PROFILE
===================================================== */
 const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password");

  if (!user)
    throw new ApiError(404, "User not found");

  res.json(user);
});

/* =====================================================
   UPDATE PROFILE
===================================================== */
 const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const user = await User.findById(req.user.id);

  if (!user)
    throw new ApiError(404, "User not found");

  if (name) user.name = name;

  await user.save();

  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/* =====================================================
   CHANGE PASSWORD
===================================================== */
 const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    throw new ApiError(400, "All password fields are required");

  const user = await User.findById(req.user.id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    throw new ApiError(400, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

/* =====================================================
   ADD ADDRESS
===================================================== */
 const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    street,
    city,
    state,
    postalCode,
    country
  } = req.body;

  const user = await User.findById(req.user.id);

  user.addresses.push({
    fullName,
    phone,
    street,
    city,
    state,
    postalCode,
    country
  });

  await user.save();

  res.json({ message: "Address added", addresses: user.addresses });
});

/* =====================================================
   UPDATE ADDRESS
===================================================== */
 const updateAddress = asyncHandler(async (req, res) => {
  const index = req.params.index;

  const user = await User.findById(req.user.id);

  if (!user.addresses[index])
    throw new ApiError(404, "Address not found");

  user.addresses[index] = {
    ...user.addresses[index]._doc,
    ...req.body
  };

  await user.save();

  res.json({ message: "Address updated", addresses: user.addresses });
});

/* =====================================================
   REMOVE ADDRESS
===================================================== */
 const removeAddress = asyncHandler(async (req, res) => {
  const index = req.params.index;

  const user = await User.findById(req.user.id);

  if (!user.addresses[index])
    throw new ApiError(404, "Address not found");

  user.addresses.splice(index, 1);

  await user.save();

  res.json({ message: "Address removed", addresses: user.addresses });
});

/* =====================================================
   ADMIN — GET ALL USERS
===================================================== */
 const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.json(users);
});

/* =====================================================
   ADMIN — GET SINGLE USER
===================================================== */
 const getUserById = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const user = await User.findById(req.params.id)
    .select("-password");

  if (!user)
    throw new ApiError(404, "User not found");

  res.json(user);
});

/* =====================================================
   ADMIN — DELETE USER
===================================================== */
 const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin")
    throw new ApiError(403, "Unauthorized");

  const user = await User.findById(req.params.id);

  if (!user)
    throw new ApiError(404, "User not found");

  await user.deleteOne();

  res.json({ message: "User deleted successfully" });
});
module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  removeAddress,
  getAllUsers,
  getUserById,
  deleteUser
};