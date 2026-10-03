import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      unique: true,
      index: true,
    },

    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },

    amount: {
      type: Number,
      required: [true, "Booking amount is required"],
      min: [1, "Booking amount must be greater than 0"],
    },

    estimatedDuration: {
      type: Number,
      required: [true, "Estimated duration is required"],
      min: [1, "Estimated duration must be at least 1 hour"],
    },

    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },

    timeSlot: {
      type: String,
      enum: [
        "morning",
        "afternoon",
        "evening",
        "anytime",
      ],
      required: true,
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
      index: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    providerNotes: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Provider notes cannot exceed 1000 characters",
      ],
      default: "",
    },

    completionNotes: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Completion notes cannot exceed 1000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;