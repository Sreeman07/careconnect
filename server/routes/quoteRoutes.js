import express from "express";

import {
  createQuote,
  getProviderQuotes,
  getAssignedProviderRequests,
  getCustomerQuotes,
  getQuoteById,
  acceptQuote,
  rejectQuote,
} from "../controllers/quoteController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
 * Provider routes
 */
router.post(
  "/",
  authorize("provider"),
  createQuote
);

router.get(
  "/provider/requests",
  authorize("provider"),
  getAssignedProviderRequests
);

router.get(
  "/provider",
  authorize("provider"),
  getProviderQuotes
);

/*
 * Customer routes
 */
router.get(
  "/customer",
  authorize("customer"),
  getCustomerQuotes
);

router.patch(
  "/:id/accept",
  authorize("customer"),
  acceptQuote
);

router.patch(
  "/:id/reject",
  authorize("customer"),
  rejectQuote
);

/*
 * Shared quote route
 */
router.get(
  "/:id",
  getQuoteById
);

export default router;