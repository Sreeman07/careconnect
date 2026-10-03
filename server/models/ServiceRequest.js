import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Request title is required"],
      trim: true,
      minlength: [5, "Title must contain at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true,
      minlength: [
        10,
        "Description must contain at least 10 characters",
      ],
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
    },

    location: {
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        maxlength: [300, "Address cannot exceed 300 characters"],
      },

      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxlength: [100, "City cannot exceed 100 characters"],
      },

      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxlength: [100, "State cannot exceed 100 characters"],
      },

      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        match: [
          /^[1-9][0-9]{5}$/,
          "Please provide a valid 6-digit pincode",
        ],
      },
    },

    preferredDate: {
      type: Date,
      required: [true, "Preferred date is required"],
    },

    preferredTimeSlot: {
      type: String,
      required: [true, "Preferred time slot is required"],
      enum: [
        "morning",
        "afternoon",
        "evening",
        "anytime",
      ],
    },

    budget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      default: 0,
    },

    attachments: [
      {
        name: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },

        type: {
          type: String,
          trim: true,
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "open",
        "matching",
        "quoted",
        "booked",
        "completed",
        "cancelled",
      ],
      default: "open",
      index: true,
    },

    urgency: {
      type: String,
      enum: [
        "low",
        "normal",
        "high",
        "emergency",
      ],
      default: "normal",
    },

    aiClassification: {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
        default: null,
      },

      requiredSkills: [
        {
          type: String,
          trim: true,
        },
      ],

      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0,
      },

      processed: {
        type: Boolean,
        default: false,
      },
    },

    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceRequest = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);

export default ServiceRequest;