import express from "express";

import {
  createReview,
  getCustomerReviews,
  getProviderReviews,
} from "../controllers/reviewController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("customer"),
  createReview
);

router.get(
  "/customer",
  authorize("customer"),
  getCustomerReviews
);

router.get(
  "/provider",
  authorize("provider"),
  getProviderReviews
);

export default router;