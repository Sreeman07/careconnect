import express from "express";

import {
  selectProviderForRequest,
} from "../controllers/providerSelectionController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/:id",
  authorize("customer"),
  selectProviderForRequest
);

export default router;