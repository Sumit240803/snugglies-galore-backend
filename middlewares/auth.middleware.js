const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError(401, "Not authorized — no token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new ApiError(401, "User belonging to this token no longer exists"));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token"));
    }
    return next(new ApiError(401, "Not authorized"));
  }
};

module.exports = { protect };