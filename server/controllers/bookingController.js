import Booking from "../models/Booking.js";
import ServiceRequest from "../models/ServiceRequest.js";
import ProviderProfile from "../models/ProviderProfile.js";
import {
  createInvoiceForBooking,
} from "./invoiceController.js";
import { createNotification } from "../services/notificationService.js";

const bookingPopulate = [
  {
    path: "serviceRequest",
    populate: [
      {
        path: "serviceCategory",
        select:
          "name description basePrice pricingUnit",
      },
    ],
  },
  {
    path: "quote",
    select:
      "amount estimatedDuration notes status",
  },
  {
    path: "customer",
    select: "name email phone",
  },
  {
    path: "provider",
    select:
      "name email phone role isVerified",
  },
  {
    path: "serviceCategory",
    select:
      "name description basePrice pricingUnit",
  },
];

/* =========================================
   SAFE NOTIFICATION HELPER
========================================= */

const sendNotificationSafely = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  relatedId = null,
}) => {
  try {
    await createNotification({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedId,
    });
  } catch (notificationError) {
    console.error(
      "Notification creation error:",
      notificationError
    );
  }
};

/* =========================================
   CUSTOMER BOOKINGS
========================================= */

export const getCustomerBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        customer: req.user._id,
      })
        .populate(bookingPopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get customer bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer bookings.",
      error: error.message,
    });
  }
};

/* =========================================
   PROVIDER BOOKINGS
========================================= */

export const getProviderBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        provider: req.user._id,
      })
        .populate(bookingPopulate)
        .sort({
          scheduledDate: 1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get provider bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch provider bookings.",
      error: error.message,
    });
  }
};

/* =========================================
   GET SINGLE BOOKING
========================================= */

export const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      ).populate(bookingPopulate);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const isCustomer =
      booking.customer._id.toString() ===
      req.user._id.toString();

    const isProvider =
      booking.provider._id.toString() ===
      req.user._id.toString();

    const isStaff = [
      "admin",
      "operations",
      "support",
    ].includes(req.user.role);

    if (
      !isCustomer &&
      !isProvider &&
      !isStaff
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this booking.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "Get booking by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking.",
      error: error.message,
    });
  }
};

/* =========================================
   START BOOKING
========================================= */

export const startBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      booking.provider.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to start this booking.",
      });
    }

    if (
      booking.status !== "scheduled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only scheduled bookings can be started.",
      });
    }

    booking.status = "in_progress";
    booking.startedAt = new Date();

    await booking.save();

    /* -----------------------------------------
       Notify customer
    ----------------------------------------- */

    await sendNotificationSafely({
      recipient: booking.customer,
      sender: booking.provider,
      type: "booking",
      title: "Job Started",
      message:
        "Your service provider has started working on your booking.",
      link: "/customer/bookings",
      relatedId: booking._id,
    });

    const populatedBooking =
      await Booking.findById(
        booking._id
      ).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message:
        "Job started successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error(
      "Start booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start job.",
      error: error.message,
    });
  }
};

/* =========================================
   COMPLETE BOOKING
========================================= */

export const completeBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (
      booking.provider.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to complete this booking.",
      });
    }

    if (
      booking.status !== "in_progress"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only in-progress bookings can be completed.",
      });
    }

    /* -----------------------------------------
       1. Complete booking
    ----------------------------------------- */

    booking.status = "completed";

    booking.completedAt =
      new Date();

    booking.completionNotes =
      req.body.completionNotes || "";

    await booking.save();

    /* -----------------------------------------
       2. Complete service request
    ----------------------------------------- */

    await ServiceRequest.findByIdAndUpdate(
      booking.serviceRequest,
      {
        $set: {
          status: "completed",
        },
      }
    );

    /* -----------------------------------------
       3. Update provider completed jobs
    ----------------------------------------- */

    await ProviderProfile.findOneAndUpdate(
      {
        user: booking.provider,
      },
      {
        $inc: {
          completedJobs: 1,
        },
      }
    );

    /* -----------------------------------------
       4. Generate invoice
    ----------------------------------------- */

    let invoice = null;

    try {
      invoice =
        await createInvoiceForBooking(
          booking._id
        );
    } catch (invoiceError) {
      console.error(
        "Invoice generation error:",
        invoiceError
      );
    }

    /* -----------------------------------------
       5. Notify customer - job completed
    ----------------------------------------- */

    await sendNotificationSafely({
      recipient: booking.customer,
      sender: booking.provider,
      type: "booking",
      title: "Job Completed",
      message:
        "Your service provider has completed the job successfully.",
      link: "/customer/bookings",
      relatedId: booking._id,
    });

    /* -----------------------------------------
       6. Notify customer - invoice ready
    ----------------------------------------- */

    if (invoice) {
      await sendNotificationSafely({
        recipient: booking.customer,
        sender: booking.provider,
        type: "invoice",
        title: "Invoice Ready",
        message:
          "Your invoice has been generated and is ready for payment.",
        link: "/customer/invoices",
        relatedId: invoice._id,
      });
    }

    /* -----------------------------------------
       7. Return completed booking
    ----------------------------------------- */

    const populatedBooking =
      await Booking.findById(
        booking._id
      ).populate(bookingPopulate);

    return res.status(200).json({
      success: true,
      message:
        "Job completed successfully.",
      booking: populatedBooking,
      invoice,
    });
  } catch (error) {
    console.error(
      "Complete booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete job.",
      error: error.message,
    });
  }
};

export { bookingPopulate };