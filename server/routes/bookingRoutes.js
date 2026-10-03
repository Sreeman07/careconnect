import express from "express";

import {
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  startBooking,
  completeBooking,
} from "../controllers/bookingController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

/*
 * Customer bookings
 */
router.get(
  "/customer",
  authorize("customer"),
  getCustomerBookings
);

/*
 * Provider bookings
 */
router.get(
  "/provider",
  authorize("provider"),
  getProviderBookings
);

/*
 * Provider job actions
 */
router.patch(
  "/:id/start",
  authorize("provider"),
  startBooking
);

router.patch(
  "/:id/complete",
  authorize("provider"),
  completeBooking
);

/*
 * Shared booking details
 */
router.get(
  "/:id",
  getBookingById
);

export default router;