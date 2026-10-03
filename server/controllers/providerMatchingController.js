import ServiceRequest from "../models/ServiceRequest.js";
import ProviderProfile from "../models/ProviderProfile.js";

const normalizeValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const normalizeArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .map((value) =>
      normalizeValue(value)
    );
};

const calculateSkillMatch = (
  requiredSkills,
  providerSkills
) => {
  const required = normalizeArray(
    requiredSkills
  );

  const provider = normalizeArray(
    providerSkills
  );

  if (required.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      skillMatchPercentage: 100,
    };
  }

  const matchedSkills = required.filter(
    (skill) => {
      return provider.some(
        (providerSkill) =>
          providerSkill === skill ||
          providerSkill.includes(skill) ||
          skill.includes(providerSkill)
      );
    }
  );

  const missingSkills = required.filter(
    (skill) =>
      !matchedSkills.includes(skill)
  );

  const skillMatchPercentage = Math.round(
    (matchedSkills.length /
      required.length) *
      100
  );

  return {
    matchedSkills,
    missingSkills,
    skillMatchPercentage,
  };
};

const calculateAreaMatch = (
  requestLocation,
  serviceAreas
) => {
  const city = normalizeValue(
    requestLocation?.city
  );

  const state = normalizeValue(
    requestLocation?.state
  );

  const areas = normalizeArray(
    serviceAreas
  );

  if (areas.length === 0) {
    return {
      matched: false,
      areaScore: 0,
      matchedArea: null,
    };
  }

  const cityMatch = areas.find(
    (area) =>
      area === city ||
      area.includes(city) ||
      city.includes(area)
  );

  if (cityMatch) {
    return {
      matched: true,
      areaScore: 15,
      matchedArea: cityMatch,
    };
  }

  const stateMatch = areas.find(
    (area) =>
      area === state ||
      area.includes(state) ||
      state.includes(area)
  );

  if (stateMatch) {
    return {
      matched: true,
      areaScore: 10,
      matchedArea: stateMatch,
    };
  }

  const allAreaMatch = areas.find(
    (area) =>
      area === "all" ||
      area === "all areas" ||
      area === "all locations"
  );

  if (allAreaMatch) {
    return {
      matched: true,
      areaScore: 10,
      matchedArea: allAreaMatch,
    };
  }

  return {
    matched: false,
    areaScore: 0,
    matchedArea: null,
  };
};

const calculateRatingScore = (
  averageRating
) => {
  const rating =
    Number(averageRating) || 0;

  const safeRating = Math.min(
    5,
    Math.max(0, rating)
  );

  return Number(
    ((safeRating / 5) * 10).toFixed(2)
  );
};

const calculateCompletedJobsScore = (
  completedJobs
) => {
  const jobs =
    Number(completedJobs) || 0;

  return Math.min(
    5,
    Number((jobs / 20).toFixed(2))
  );
};

const getMatchingProviders = async (
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
      }).populate(
        "serviceCategory",
        "name slug requiredSkills"
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
          "Cancelled service requests cannot be matched with providers.",
      });
    }

    if (
      !serviceRequest.serviceCategory
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Service category is missing from this request.",
      });
    }

    if (
      !serviceRequest.aiClassification
        ?.processed
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please run AI classification before matching providers.",
      });
    }

    const requiredSkills =
      serviceRequest.aiClassification
        .requiredSkills?.length > 0
        ? serviceRequest.aiClassification
            .requiredSkills
        : serviceRequest.serviceCategory
            .requiredSkills || [];

    const providerProfiles =
      await ProviderProfile.find({
        verificationStatus: "verified",
        servicesOffered:
          serviceRequest.serviceCategory
            ._id,
      })
        .populate(
          "user",
          "name email phone profileImage isActive isVerified"
        )
        .populate(
          "servicesOffered",
          "name slug"
        );

    const activeProviders =
      providerProfiles.filter(
        (profile) =>
          profile.user &&
          profile.user.isActive !== false
      );

    const matches =
      activeProviders.map(
        (providerProfile) => {
          const skillMatch =
            calculateSkillMatch(
              requiredSkills,
              providerProfile.skills
            );

          const areaMatch =
            calculateAreaMatch(
              serviceRequest.location,
              providerProfile.serviceAreas
            );

          const ratingScore =
            calculateRatingScore(
              providerProfile.averageRating
            );

          const completedJobsScore =
            calculateCompletedJobsScore(
              providerProfile.completedJobs
            );

          const skillScore =
            (skillMatch.skillMatchPercentage /
              100) *
            30;

          const totalScore = Math.round(
            (
              40 +
              skillScore +
              areaMatch.areaScore +
              ratingScore +
              completedJobsScore
            ) * 100
          ) / 100;

          return {
            provider: {
              id: providerProfile.user._id,
              name: providerProfile.user.name,
              email: providerProfile.user.email,
              phone: providerProfile.user.phone,
              profileImage:
                providerProfile.user
                  .profileImage || "",
            },

            profile: {
              id: providerProfile._id,
              bio: providerProfile.bio,
              experience:
                providerProfile.experience,
              skills:
                providerProfile.skills,
              serviceAreas:
                providerProfile.serviceAreas,
              servicesOffered:
                providerProfile.servicesOffered,
              hourlyRate:
                providerProfile.hourlyRate,
              averageRating:
                providerProfile.averageRating,
              totalReviews:
                providerProfile.totalReviews,
              completedJobs:
                providerProfile.completedJobs,
              verificationStatus:
                providerProfile.verificationStatus,
            },

            match: {
              score: totalScore,
              categoryMatch: true,
              skillMatchPercentage:
                skillMatch.skillMatchPercentage,
              matchedSkills:
                skillMatch.matchedSkills,
              missingSkills:
                skillMatch.missingSkills,
              areaMatch:
                areaMatch.matched,
              matchedArea:
                areaMatch.matchedArea,
              ratingScore,
              completedJobsScore,
            },
          };
        }
      );

    matches.sort(
      (a, b) =>
        b.match.score -
        a.match.score
    );

    const topMatches =
      matches.slice(0, 10);

    return res.status(200).json({
      success: true,
      message:
        "Provider matching completed successfully.",
      data: {
        request: {
          id: serviceRequest._id,
          title: serviceRequest.title,
          category:
            serviceRequest.serviceCategory,
          requiredSkills,
          location:
            serviceRequest.location,
          urgency:
            serviceRequest.urgency,
        },
        totalProvidersChecked:
          activeProviders.length,
        totalMatches:
          topMatches.length,
        providers: topMatches,
      },
    });
  } catch (error) {
    console.error(
      "Provider matching error:",
      error
    );

    next(error);
  }
};

export {
  getMatchingProviders,
};