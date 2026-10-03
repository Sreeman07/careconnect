import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import serviceCategoryRoutes from "./routes/serviceCategoryRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import providerMatchingRoutes from "./routes/providerMatchingRoutes.js";
import providerSelectionRoutes from "./routes/providerSelectionRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Error middleware
import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

/*
|--------------------------------------------------------------------------
| Database Connection
|--------------------------------------------------------------------------
*/

connectDB();

/*
|--------------------------------------------------------------------------
| CORS Configuration
|--------------------------------------------------------------------------
*/

const clientUrl =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Body Parsers
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Cookie Parser
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This MUST come before any protected route because
| authMiddleware.js reads req.cookies.token.
|
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CareConnect API is running.",
    port: process.env.PORT || 1000,
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.use(
  "/api/health",
  healthRoutes
);

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);

/*
|--------------------------------------------------------------------------
| Admin Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRoutes
);

/*
|--------------------------------------------------------------------------
| Provider Management
|--------------------------------------------------------------------------
*/

app.use(
  "/api/providers",
  providerRoutes
);

/*
|--------------------------------------------------------------------------
| Service Categories
|--------------------------------------------------------------------------
*/

app.use(
  "/api/service-categories",
  serviceCategoryRoutes
);

/*
|--------------------------------------------------------------------------
| Service Requests
|--------------------------------------------------------------------------
*/

app.use(
  "/api/service-requests",
  serviceRequestRoutes
);

/*
|--------------------------------------------------------------------------
| AI Services
|--------------------------------------------------------------------------
*/

app.use(
  "/api/ai",
  aiRoutes
);

/*
|--------------------------------------------------------------------------
| AI Provider Matching
|--------------------------------------------------------------------------
*/

app.use(
  "/api/provider-matching",
  providerMatchingRoutes
);

/*
|--------------------------------------------------------------------------
| Provider Selection
|--------------------------------------------------------------------------
*/

app.use(
  "/api/provider-selection",
  providerSelectionRoutes
);

/*
|--------------------------------------------------------------------------
| Quotes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/quotes",
  quoteRoutes
);

/*
|--------------------------------------------------------------------------
| Bookings
|--------------------------------------------------------------------------
*/

app.use(
  "/api/bookings",
  bookingRoutes
);

/*
|--------------------------------------------------------------------------
| Reviews
|--------------------------------------------------------------------------
*/

app.use(
  "/api/reviews",
  reviewRoutes
);

/*
|--------------------------------------------------------------------------
| Invoices
|--------------------------------------------------------------------------
*/

app.use(
  "/api/invoices",
  invoiceRoutes
);

/*
|--------------------------------------------------------------------------
| Payments
|--------------------------------------------------------------------------
*/

app.use(
  "/api/payments",
  paymentRoutes
);

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

app.use(
  "/api/notifications",
  notificationRoutes
);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(
    `CareConnect server running on port ${PORT}`
  );

  console.log(
    `Client URL: ${clientUrl}`
  );
});