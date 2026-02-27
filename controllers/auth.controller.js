const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/AsyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
/* =====================================================
   ADMIN EMAILS FROM ENV
===================================================== */
const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((email) =>
      email.trim().toLowerCase()
    )
  : [];

/* =====================================================
   GENERATE TOKENS
===================================================== */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );
};

/* =====================================================
   HELPER: HASH REFRESH TOKEN (SHA-256)
===================================================== */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const saveRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    refreshToken: hashToken(refreshToken),
  });
};

/* =====================================================
   REGISTER USER
===================================================== */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new ApiError(400, "All fields are required");

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser)
    throw new ApiError(400, "Email already registered");

  const hashedPassword = await bcrypt.hash(password, 12);

  // Auto assign admin role if email is in ADMIN_EMAILS
  const role = ADMIN_EMAILS.includes(normalizedEmail)
    ? "admin"
    : "customer";

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveRefreshToken(user._id, refreshToken);

  user.password = undefined;

  res.status(201).json({
    user,
    accessToken,
    refreshToken,
  });
});

/* =====================================================
   LOGIN USER
===================================================== */
 const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "Email and password are required");

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user)
    throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await saveRefreshToken(user._id, refreshToken);

  user.password = undefined;

  res.json({
    user,
    accessToken,
    refreshToken,
  });
});

/* =====================================================
   REFRESH TOKEN (with rotation)
===================================================== */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    throw new ApiError(400, "Refresh token required");

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user)
    throw new ApiError(401, "User not found");

  // Verify refresh token matches stored hash
  if (!user.refreshToken || user.refreshToken !== hashToken(refreshToken)) {
    // Potential token reuse detected — invalidate for safety
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(401, "Refresh token is invalid — please log in again");
  }

  // Rotate: issue new access + refresh tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await saveRefreshToken(user._id, newRefreshToken);

  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

/* =====================================================
   GET CURRENT USER (PROTECTED)
===================================================== */
 const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password");

  if (!user)
    throw new ApiError(404, "User not found");

  res.json(user);
});

/* =====================================================
   LOGOUT
===================================================== */
const logout = asyncHandler(async (req, res) => {
  // Invalidate the stored refresh token
  await User.findByIdAndUpdate(req.user.id, { refreshToken: undefined });

  res.json({ message: "Logged out successfully" });
});

module.exports = {
  register,
  login,
  refreshAccessToken,
  getMe,
  logout
};