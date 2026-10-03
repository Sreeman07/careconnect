import express from "express";

import {
  getMatchingProviders,
} from "../controllers/providerMatchingController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/:id",
  authorize("customer"),
  getMatchingProviders
);

export default router;