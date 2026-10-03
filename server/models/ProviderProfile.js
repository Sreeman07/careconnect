import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Bio cannot exceed 1000 characters",
      ],
      default: "",
    },

    experience: {
      type: Number,
      min: 0,
      max: 60,
      default: 0,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    serviceAreas: [
      {
        type: String,
        trim: true,
      },
    ],

    servicesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceCategory",
      },
    ],

    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_submitted",
        "pending",
        "verified",
        "rejected",
      ],
      default: "not_submitted",
    },

    verificationDocuments: [
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

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedJobs: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ProviderProfile = mongoose.model(
  "ProviderProfile",
  providerProfileSchema
);

export default ProviderProfile;