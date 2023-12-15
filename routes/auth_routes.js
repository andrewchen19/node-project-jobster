const express = require("express");
const router = express.Router();

const { register, login, updateUser } = require("../controllers/auth");
const authMiddleware = require("../middleware/auth");

// limit the access of "register" & "login" route (not whole application)
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// local middleware (package & custom)
router.post("/register", limiter, register);
router.post("/login", limiter, login);
router.patch("/updateUser", authMiddleware, updateUser);

module.exports = router;
