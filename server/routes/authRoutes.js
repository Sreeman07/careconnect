import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Name must be between 2 and 100 characters."
    ),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("phone")
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage(
      "Phone number must be a valid 10-digit Indian mobile number."
    ),

  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage(
      "Password must contain at least 6 characters."
    ),

  body("role")
    .optional()
    .isIn(["customer", "provider"])
    .withMessage(
      "Role must be either customer or provider."
    ),
];

const loginValidation = [
  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required."),
];

router.post(
  "/register",
  validate(registerValidation),
  register
);

router.post(
  "/login",
  validate(loginValidation),
  login
);

router.post("/logout", logout);

router.get("/me", protect, getCurrentUser);

export default router;