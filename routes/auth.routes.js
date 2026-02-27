const express = require('express');
const { register, login, refreshAccessToken, getMe, logout } = require("../controllers/auth.controller");

const  {protect}  = require("../middlewares/auth.middleware");
const authRouter = express.Router();

/* =====================================================
   PUBLIC ROUTES
===================================================== */

// Register new user
authRouter.post("/register", register);

// Login user
authRouter.post("/login", login);

// Refresh access token
authRouter.post("/refresh-token", refreshAccessToken);


/* =====================================================
   PROTECTED ROUTES
===================================================== */

// Get current logged-in user
authRouter.get("/me", protect, getMe);

// Logout
authRouter.post("/logout", protect, logout);

module.exports = authRouter;