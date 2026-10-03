import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import ServiceCategory from "../models/ServiceCategory.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Booking from "../models/Booking.js";
import Quote from "../models/Quote.js";

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      verifiedProviders,
      pendingVerifications,
      totalServiceCategories,
      totalServiceRequests,
      activeBookings,
      completedBookings,
      pendingQuotes,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "provider",
      }),

      ProviderProfile.countDocuments({
        verificationStatus: "verified",
      }),

      ProviderProfile.countDocuments({
        verificationStatus: "pending",
      }),

      ServiceCategory.countDocuments(),

      ServiceRequest.countDocuments(),

      Booking.countDocuments({
        status: {
          $in: ["scheduled", "in_progress"],
        },
      }),

      Booking.countDocuments({
        status: "completed",
      }),

      Quote.countDocuments({
        status: "pending",
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          providers: totalProviders,
        },

        providers: {
          total: totalProviders,
          verified: verifiedProviders,
          pendingVerification:
            pendingVerifications,
        },

        serviceCategories:
          totalServiceCategories,

        serviceRequests:
          totalServiceRequests,

        bookings: {
          active: activeBookings,
          completed: completedBookings,
        },

        quotes: {
          pending: pendingQuotes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardStats,
};