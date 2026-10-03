import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service category name is required."],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    icon: {
      type: String,
      trim: true,
      default: "🔧",
    },

    basePrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    pricingUnit: {
      type: String,
      enum: [
        "per_hour",
        "per_job",
        "per_visit",
        "per_day",
      ],
      default: "per_job",
    },

    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ServiceCategory = mongoose.model(
  "ServiceCategory",
  serviceCategorySchema
);

export default ServiceCategory;