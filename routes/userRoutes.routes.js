const express = require("express");
const router = express.Router();

// Import Middlewares
const { authentication } = require("../middlewares/authMiddleware");

// Import Controllers
const {
  registerController,
  loginController,
  getCurrentUser,
} = require("../controllers/userControllers.controllers");

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/").get(authentication, getCurrentUser);

module.exports = router;
