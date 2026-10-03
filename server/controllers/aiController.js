import ServiceRequest from "../models/ServiceRequest.js";
import ServiceCategory from "../models/ServiceCategory.js";

import {
  classifyServiceRequest,
} from "../services/geminiService.js";

const classifyRequestWithAI = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const serviceRequest =
      await ServiceRequest.findOne({
        _id: id,
        customer: req.user._id,
      })
        .populate(
          "serviceCategory",
          "name description requiredSkills"
        )
        .populate(
          "customer",
          "name email phone"
        );

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Service request not found.",
      });
    }

    if (
      serviceRequest.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled service requests cannot be classified.",
      });
    }

    const categories =
      await ServiceCategory.find({
        isActive: true,
      })
        .select(
          "name description requiredSkills"
        )
        .sort({ name: 1 });

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No active service categories are available.",
      });
    }

    const classification =
      await classifyServiceRequest({
        title: serviceRequest.title,
        description:
          serviceRequest.description,
        categories,
      });

    serviceRequest.aiClassification = {
      category:
        classification.category._id,
      requiredSkills:
        classification.requiredSkills,
      confidence:
        classification.confidence,
      processed: true,
    };

    serviceRequest.urgency =
      classification.urgency;

    await serviceRequest.save();

    const updatedRequest =
      await ServiceRequest.findById(
        serviceRequest._id
      )
        .populate(
          "serviceCategory",
          "name slug description basePrice pricingUnit requiredSkills"
        )
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "assignedProvider",
          "name email phone"
        );

    return res.status(200).json({
      success: true,
      message:
        "Service request classified successfully using AI.",
      data: {
        request: updatedRequest,
        aiClassification: {
          category:
            classification.category,
          requiredSkills:
            classification.requiredSkills,
          urgency:
            classification.urgency,
          confidence:
            classification.confidence,
          summary:
            classification.summary,
        },
      },
    });
  } catch (error) {
    console.error(
      "AI classification error:",
      error
    );

    next(error);
  }
};

export {
  classifyRequestWithAI,
};