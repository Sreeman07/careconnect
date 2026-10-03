import express from "express";

import {
  classifyRequestWithAI,
} from "../controllers/aiController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/classify-request/:id",
  authorize("customer"),
  classifyRequestWithAI
);

export default router;