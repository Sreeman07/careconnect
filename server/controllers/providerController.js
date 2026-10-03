import ProviderProfile from "../models/ProviderProfile.js";
import User from "../models/User.js";

const providerPopulate = [
  {
    path: "user",
    select:
      "name email phone profileImage role isActive isVerified",
  },
  {
    path: "servicesOffered",
    select:
      "name slug description icon basePrice pricingUnit requiredSkills isActive",
  },
];

const getMyProfile = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "provider") {
      res.status(403);

      throw new Error(
        "Only service providers can access this profile."
      );
    }

    let profile =
      await ProviderProfile.findOne({
        user: req.user._id,
      }).populate(providerPopulate);

    if (!profile) {
      const newProfile =
        await ProviderProfile.create({
          user: req.user._id,
        });

      profile =
        await ProviderProfile.findById(
          newProfile._id
        ).populate(providerPopulate);
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (
  req,
  res,
  next
) => {
  try {
    if (req.user.role !== "provider") {
      res.status(403);

      throw new Error(
        "Only service providers can update this profile."
      );
    }

    const {
      name,
      phone,
      bio,
      experience,
      skills,
      serviceAreas,
      servicesOffered,
      hourlyRate,
    } = req.body;

    let profile =
      await ProviderProfile.findOne({
        user: req.user._id,
      });

    if (!profile) {
      profile =
        new ProviderProfile({
          user: req.user._id,
        });
    }

    if (name !== undefined) {
      const trimmedName =
        String(name).trim();

      if (trimmedName.length < 2) {
        res.status(400);

        throw new Error(
          "Name must contain at least 2 characters."
        );
      }

      req.user.name =
        trimmedName;
    }

    if (phone !== undefined) {
      const trimmedPhone =
        String(phone).trim();

      if (
        !/^[6-9]\d{9}$/.test(
          trimmedPhone
        )
      ) {
        res.status(400);

        throw new Error(
          "Please provide a valid 10-digit Indian phone number."
        );
      }

      req.user.phone =
        trimmedPhone;
    }

    if (bio !== undefined) {
      profile.bio =
        String(bio).trim();
    }

    if (experience !== undefined) {
      const experienceValue =
        Number(experience);

      if (
        Number.isNaN(
          experienceValue
        ) ||
        experienceValue < 0 ||
        experienceValue > 60
      ) {
        res.status(400);

        throw new Error(
          "Experience must be between 0 and 60 years."
        );
      }

      profile.experience =
        experienceValue;
    }

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        res.status(400);

        throw new Error(
          "Skills must be provided as an array."
        );
      }

      profile.skills = [
        ...new Set(
          skills
            .map((skill) =>
              String(skill).trim()
            )
            .filter(Boolean)
        ),
      ];
    }

    if (serviceAreas !== undefined) {
      if (
        !Array.isArray(
          serviceAreas
        )
      ) {
        res.status(400);

        throw new Error(
          "Service areas must be provided as an array."
        );
      }

      profile.serviceAreas = [
        ...new Set(
          serviceAreas
            .map((area) =>
              String(area).trim()
            )
            .filter(Boolean)
        ),
      ];
    }

    if (
      servicesOffered !== undefined
    ) {
      if (
        !Array.isArray(
          servicesOffered
        )
      ) {
        res.status(400);

        throw new Error(
          "Services offered must be provided as an array."
        );
      }

      profile.servicesOffered = [
        ...new Set(
          servicesOffered
            .map((id) =>
              String(id).trim()
            )
            .filter(Boolean)
        ),
      ];
    }

    if (hourlyRate !== undefined) {
      const rate =
        Number(hourlyRate);

      if (
        Number.isNaN(rate) ||
        rate < 0
      ) {
        res.status(400);

        throw new Error(
          "Hourly rate cannot be negative."
        );
      }

      profile.hourlyRate = rate;
    }

    await req.user.save();

    await profile.save();

    const updatedProfile =
      await ProviderProfile.findById(
        profile._id
      ).populate(providerPopulate);

    res.status(200).json({
      success: true,

      message:
        "Provider profile updated successfully.",

      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const submitVerification =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        req.user.role !==
        "provider"
      ) {
        res.status(403);

        throw new Error(
          "Only service providers can submit verification."
        );
      }

      const profile =
        await ProviderProfile.findOne({
          user: req.user._id,
        });

      if (!profile) {
        res.status(404);

        throw new Error(
          "Please complete your provider profile first."
        );
      }

      if (
        profile.verificationStatus ===
        "verified"
      ) {
        res.status(400);

        throw new Error(
          "Your profile is already verified."
        );
      }

      if (
        profile.skills.length === 0
      ) {
        res.status(400);

        throw new Error(
          "Add at least one professional skill."
        );
      }

      if (
        profile.serviceAreas
          .length === 0
      ) {
        res.status(400);

        throw new Error(
          "Add at least one service area."
        );
      }

      if (
        profile.servicesOffered
          .length === 0
      ) {
        res.status(400);

        throw new Error(
          "Select at least one service."
        );
      }

      profile.verificationStatus =
        "pending";

      profile.rejectionReason =
        "";

      await profile.save();

      const updatedProfile =
        await ProviderProfile.findById(
          profile._id
        ).populate(providerPopulate);

      res.status(200).json({
        success: true,

        message:
          "Verification request submitted successfully.",

        profile: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

const getProviderById = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await ProviderProfile.findById(
        req.params.id
      ).populate(providerPopulate);

    if (!profile) {
      res.status(404);

      throw new Error(
        "Provider profile not found."
      );
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProviders = async (
  req,
  res,
  next
) => {
  try {
    const {
      verificationStatus,
      search,
      service,
    } = req.query;

    const query = {};

    if (verificationStatus) {
      query.verificationStatus =
        verificationStatus;
    }

    if (service) {
      query.servicesOffered =
        service;
    }

    let profiles =
      await ProviderProfile.find(
        query
      )
        .populate(providerPopulate)
        .sort({
          createdAt: -1,
        });

    if (search) {
      const searchTerm =
        search
          .toLowerCase()
          .trim();

      profiles =
        profiles.filter(
          (profile) => {
            const name =
              profile.user?.name?.toLowerCase() ||
              "";

            const email =
              profile.user?.email?.toLowerCase() ||
              "";

            const skills =
              profile.skills
                .join(" ")
                .toLowerCase();

            const areas =
              profile.serviceAreas
                .join(" ")
                .toLowerCase();

            const services =
              profile.servicesOffered
                .map(
                  (item) =>
                    item.name
                )
                .join(" ")
                .toLowerCase();

            return (
              name.includes(
                searchTerm
              ) ||
              email.includes(
                searchTerm
              ) ||
              skills.includes(
                searchTerm
              ) ||
              areas.includes(
                searchTerm
              ) ||
              services.includes(
                searchTerm
              )
            );
          }
        );
    }

    res.status(200).json({
      success: true,
      count: profiles.length,
      providers: profiles,
    });
  } catch (error) {
    next(error);
  }
};

const verifyProvider = async (
  req,
  res,
  next
) => {
  try {
    const profile =
      await ProviderProfile.findById(
        req.params.id
      );

    if (!profile) {
      res.status(404);

      throw new Error(
        "Provider profile not found."
      );
    }

    profile.verificationStatus =
      "verified";

    profile.rejectionReason =
      "";

    await profile.save();

    await User.findByIdAndUpdate(
      profile.user,
      {
        isVerified: true,
      }
    );

    const updatedProfile =
      await ProviderProfile.findById(
        profile._id
      ).populate(providerPopulate);

    res.status(200).json({
      success: true,

      message:
        "Provider verified successfully.",

      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const rejectProvider = async (
  req,
  res,
  next
) => {
  try {
    const {
      reason,
    } = req.body;

    if (
      !reason ||
      !reason.trim()
    ) {
      res.status(400);

      throw new Error(
        "A rejection reason is required."
      );
    }

    const profile =
      await ProviderProfile.findById(
        req.params.id
      );

    if (!profile) {
      res.status(404);

      throw new Error(
        "Provider profile not found."
      );
    }

    profile.verificationStatus =
      "rejected";

    profile.rejectionReason =
      reason.trim();

    await profile.save();

    await User.findByIdAndUpdate(
      profile.user,
      {
        isVerified: false,
      }
    );

    const updatedProfile =
      await ProviderProfile.findById(
        profile._id
      ).populate(providerPopulate);

    res.status(200).json({
      success: true,

      message:
        "Provider verification rejected.",

      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProviderStatus =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        isActive,
      } = req.body;

      if (
        typeof isActive !==
        "boolean"
      ) {
        res.status(400);

        throw new Error(
          "isActive must be a boolean."
        );
      }

      const profile =
        await ProviderProfile.findById(
          req.params.id
        );

      if (!profile) {
        res.status(404);

        throw new Error(
          "Provider profile not found."
        );
      }

      await User.findByIdAndUpdate(
        profile.user,
        {
          isActive,
        }
      );

      const updatedProfile =
        await ProviderProfile.findById(
          profile._id
        ).populate(providerPopulate);

      res.status(200).json({
        success: true,

        message: isActive
          ? "Provider activated successfully."
          : "Provider deactivated successfully.",

        profile: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

export {
  getMyProfile,
  updateMyProfile,
  submitVerification,
  getProviderById,
  getAllProviders,
  verifyProvider,
  rejectProvider,
  updateProviderStatus,
};