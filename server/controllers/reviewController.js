import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";
import { createNotification } from "../services/notificationService.js";

const reviewPopulate = [
  {
    path: "customer",
    select: "name email",
  },
  {
    path: "provider",
    select: "name email",
  },
  {
    path: "booking",
    select:
      "amount scheduledDate status serviceCategory",
    populate: {
      path: "serviceCategory",
      select: "name description",
    },
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
   CREATE REVIEW
========================================= */

export const createReview = async (
  req,
  res
) => {
  try {
    const {
      bookingId,
      rating,
      comment,
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be a whole number between 1 and 5.",
      });
    }

    const booking =
      await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /* -----------------------------------------
       Customer ownership
    ----------------------------------------- */

    if (
      booking.customer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to review this booking.",
      });
    }

    /* -----------------------------------------
       Booking must be completed
    ----------------------------------------- */

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can review a booking only after the job is completed.",
      });
    }

    /* -----------------------------------------
       Prevent duplicate review
    ----------------------------------------- */

    const existingReview =
      await Review.findOne({
        booking: booking._id,
      });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this booking.",
        review: existingReview,
      });
    }

    /* -----------------------------------------
       Create review
    ----------------------------------------- */

    const review = await Review.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      rating: numericRating,
      comment:
        typeof comment === "string"
          ? comment.trim()
          : "",
    });

    /* -----------------------------------------
       Recalculate provider rating
    ----------------------------------------- */

    const providerReviews =
      await Review.find({
        provider: booking.provider,
        isVisible: true,
      }).select("rating");

    const totalReviews =
      providerReviews.length;

    const totalRating =
      providerReviews.reduce(
        (sum, item) => sum + item.rating,
        0
      );

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              totalRating /
              totalReviews
            ).toFixed(2)
          )
        : 0;

    await ProviderProfile.findOneAndUpdate(
      {
        user: booking.provider,
      },
      {
        $set: {
          averageRating,
          totalReviews,
        },
      }
    );

    /* -----------------------------------------
       Notify provider
    ----------------------------------------- */

    await sendNotificationSafely({
      recipient: booking.provider,
      sender: booking.customer,
      type: "review",
      title: "New Review Received",
      message: `You received a ${numericRating}-star review from a customer.`,
      link: "/provider/reviews",
      relatedId: review._id,
    });

    const populatedReview =
      await Review.findById(
        review._id
      ).populate(reviewPopulate);

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit review.",
      error: error.message,
    });
  }
};

/* =========================================
   GET CUSTOMER REVIEWS
========================================= */

export const getCustomerReviews = async (
  req,
  res
) => {
  try {
    const reviews =
      await Review.find({
        customer: req.user._id,
      })
        .populate(reviewPopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get customer reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer reviews.",
      error: error.message,
    });
  }
};

/* =========================================
   GET PROVIDER REVIEWS
========================================= */

export const getProviderReviews = async (
  req,
  res
) => {
  try {
    const reviews =
      await Review.find({
        provider: req.user._id,
        isVisible: true,
      })
        .populate(reviewPopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(
      "Get provider reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch provider reviews.",
      error: error.message,
    });
  }
};