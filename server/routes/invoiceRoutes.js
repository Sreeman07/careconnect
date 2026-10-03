import express from "express";

import {
  getCustomerInvoices,
  getProviderInvoices,
  getInvoiceById,
} from "../controllers/invoiceController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/customer",
  authorize("customer"),
  getCustomerInvoices
);

router.get(
  "/provider",
  authorize("provider"),
  getProviderInvoices
);

router.get(
  "/:id",
  getInvoiceById
);

export default router;