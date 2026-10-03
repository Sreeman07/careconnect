import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  submitVerification,
  getProviderById,
  getAllProviders,
  verifyProvider,
  rejectProvider,
  updateProviderStatus,
} from "../controllers/providerController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Provider's Own Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protect,
  authorize("provider"),
  getMyProfile
);

router.put(
  "/me",
  protect,
  authorize("provider"),
  updateMyProfile
);

router.post(
  "/me/submit-verification",
  protect,
  authorize("provider"),
  submitVerification
);

/*
|--------------------------------------------------------------------------
| Admin Provider Management
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  authorize(
    "admin",
    "operations",
    "support"
  ),
  getAllProviders
);

router.get(
  "/:id",
  protect,
  getProviderById
);

router.patch(
  "/:id/verify",
  protect,
  authorize("admin"),
  verifyProvider
);

router.patch(
  "/:id/reject",
  protect,
  authorize("admin"),
  rejectProvider
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateProviderStatus
);

export default router;