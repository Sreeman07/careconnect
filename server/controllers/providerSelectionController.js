import ServiceRequest from "../models/ServiceRequest.js";
import ProviderProfile from "../models/ProviderProfile.js";

const selectProviderForRequest = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required.",
      });
    }

    const serviceRequest =
      await ServiceRequest.findOne({
        _id: id,
        customer: req.user._id,
      });

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found.",
      });
    }

    if (
      !["open", "matching", "quoted"].includes(
        serviceRequest.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A provider cannot be selected for this request in its current status.",
      });
    }

    if (
      serviceRequest.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled requests cannot have a provider selected.",
      });
    }

    const providerProfile =
      await ProviderProfile.findOne({
        user: providerId,
        verificationStatus: "verified",
        servicesOffered:
          serviceRequest.serviceCategory,
      }).populate(
        "user",
        "name email phone profileImage isActive"
      );

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message:
          "The selected provider is not verified or does not offer this service.",
      });
    }

    if (
      !providerProfile.user ||
      providerProfile.user.isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The selected provider account is inactive.",
      });
    }

    serviceRequest.assignedProvider =
      providerId;

    serviceRequest.status = "matching";

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
          "name email phone profileImage"
        );

    return res.status(200).json({
      success: true,
      message:
        "Provider selected successfully.",
      data: {
        request: updatedRequest,
        provider: {
          id: providerProfile.user._id,
          name: providerProfile.user.name,
          email: providerProfile.user.email,
          phone: providerProfile.user.phone,
          profileImage:
            providerProfile.user.profileImage ||
            "",
          experience:
            providerProfile.experience,
          averageRating:
            providerProfile.averageRating,
          totalReviews:
            providerProfile.totalReviews,
          completedJobs:
            providerProfile.completedJobs,
        },
      },
    });
  } catch (error) {
    console.error(
      "Provider selection error:",
      error
    );

    next(error);
  }
};

export {
  selectProviderForRequest,
};