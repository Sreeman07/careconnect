import express from "express";

import {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
} from "../controllers/serviceRequestController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("customer"));

router.post("/", createServiceRequest);

router.get("/", getMyServiceRequests);

router.get("/:id", getServiceRequestById);

router.put("/:id", updateServiceRequest);

router.patch(
  "/:id/cancel",
  cancelServiceRequest
);

export default router;