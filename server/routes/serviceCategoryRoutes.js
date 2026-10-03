import express from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../controllers/serviceCategoryController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public / Authenticated Category Routes
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  protect,
  getCategories
);

router.get(
  "/:id",
  protect,
  getCategoryById
);

/*
|--------------------------------------------------------------------------
| Admin Category Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  protect,
  authorize("admin"),
  createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCategory
);

router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateCategoryStatus
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteCategory
);

export default router;