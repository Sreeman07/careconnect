import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
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

    amount: {
      type: Number,
      required: [true, "Quote amount is required"],
      min: [1, "Quote amount must be greater than 0"],
    },

    estimatedDuration: {
      type: Number,
      required: [
        true,
        "Estimated duration is required",
      ],
      min: [
        1,
        "Estimated duration must be at least 1 hour",
      ],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Quote notes cannot exceed 1000 characters",
      ],
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "expired",
        "withdrawn",
      ],
      default: "pending",
      index: true,
    },

    customerResponseAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Quote = mongoose.model(
  "Quote",
  quoteSchema
);

export default Quote;