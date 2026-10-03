import express from "express";

import {
  createPayment,
  getCustomerPayments,
  getProviderPayments,
  getPaymentById,
} from "../controllers/paymentController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("customer"),
  createPayment
);

router.get(
  "/customer",
  authorize("customer"),
  getCustomerPayments
);

router.get(
  "/provider",
  authorize("provider"),
  getProviderPayments
);

router.get(
  "/:id",
  getPaymentById
);

export default router;