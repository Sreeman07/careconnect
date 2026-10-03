import { useEffect, useState } from "react";

import {
  getMyProfile,
  updateMyProfile,
  submitVerification,
} from "../../services/providerService";

import {
  getCategories,
} from "../../services/serviceCategoryService";

const ProviderProfile = () => {
  const [profile, setProfile] =
    useState(null);

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    submittingVerification,
    setSubmittingVerification,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      bio: "",
      experience: "",
      skills: "",
      serviceAreas: "",
      servicesOffered: [],
      hourlyRate: "",
    });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileResponse,
        categoryResponse,
      ] = await Promise.all([
        getMyProfile(),
        getCategories(),
      ]);

      const provider =
        profileResponse.profile;

      setProfile(provider);

      setCategories(
        categoryResponse.categories ||
          []
      );

      setFormData({
        name:
          provider.user?.name ||
          "",

        phone:
          provider.user?.phone ||
          "",

        bio:
          provider.bio || "",

        experience:
          provider.experience ?? "",

        skills:
          provider.skills?.join(
            ", "
          ) || "",

        serviceAreas:
          provider.serviceAreas?.join(
            ", "
          ) || "",

        servicesOffered:
          provider.servicesOffered?.map(
            (service) =>
              service._id
          ) || [],

        hourlyRate:
          provider.hourlyRate ?? "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load provider profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const toggleService = (
    serviceId
  ) => {
    setFormData(
      (previous) => {
        const selected =
          previous.servicesOffered.includes(
            serviceId
          );

        return {
          ...previous,

          servicesOffered:
            selected
              ? previous.servicesOffered.filter(
                  (id) =>
                    id !==
                    serviceId
                )
              : [
                  ...previous.servicesOffered,
                  serviceId,
                ],
        };
      }
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response =
        await updateMyProfile({
          name:
            formData.name.trim(),

          phone:
            formData.phone.trim(),

          bio:
            formData.bio.trim(),

          experience:
            Number(
              formData.experience
            ) || 0,

          skills:
            formData.skills
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

          serviceAreas:
            formData.serviceAreas
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

          servicesOffered:
            formData.servicesOffered,

          hourlyRate:
            Number(
              formData.hourlyRate
            ) || 0,
        });

      setProfile(
        response.profile
      );

      setMessage(
        "Profile saved successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save provider profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleVerification =
    async () => {
      try {
        setSubmittingVerification(
          true
        );

        setError("");
        setMessage("");

        const response =
          await submitVerification();

        setProfile(
          response.profile
        );

        setMessage(
          "Verification request submitted successfully."
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to submit verification."
        );
      } finally {
        setSubmittingVerification(
          false
        );
      }
    };

  const getStatusStyle = () => {
    switch (
      profile?.verificationStatus
    ) {
      case "verified":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading provider profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Provider Profile
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your professional information,
            services, and verification.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle()}`}
        >
          {(
            profile?.verificationStatus ||
            "not_submitted"
          )
            .replace(
              "_",
              " "
            )
            .toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rejection */}
      {profile?.rejectionReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-800">
            Verification Rejected
          </h3>

          <p className="mt-2 text-sm text-red-700">
            {profile.rejectionReason}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-3"
      >
        {/* Main profile */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold">
            Professional Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                required
                maxLength="10"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Experience (Years)
              </label>

              <input
                name="experience"
                type="number"
                min="0"
                max="60"
                value={
                  formData.experience
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Rate */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Hourly Rate (₹)
              </label>

              <input
                name="hourlyRate"
                type="number"
                min="0"
                value={
                  formData.hourlyRate
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Professional Skills
              </label>

              <input
                name="skills"
                value={
                  formData.skills
                }
                onChange={
                  handleChange
                }
                placeholder="Pipe Repair, Leak Detection, Water Tank Repair"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate skills using commas.
              </p>
            </div>

            {/* Areas */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Service Areas
              </label>

              <input
                name="serviceAreas"
                value={
                  formData.serviceAreas
                }
                onChange={
                  handleChange
                }
                placeholder="Hyderabad, Kukatpally, Secunderabad"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate locations using commas.
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="mt-8">
            <div className="mb-3">
              <h3 className="text-lg font-bold">
                Services You Provide
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select the services you are qualified to perform.
              </p>
            </div>

            {categories.length ===
            0 ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-700">
                No active service categories are available.
                Ask an administrator to create services.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {categories.map(
                  (category) => {
                    const selected =
                      formData.servicesOffered.includes(
                        category._id
                      );

                    return (
                      <button
                        key={
                          category._id
                        }
                        type="button"
                        onClick={() =>
                          toggleService(
                            category._id
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                            {
                              category.icon
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">
                              {
                                category.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Base price ₹
                              {
                                category.basePrice
                              }
                            </p>
                          </div>

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-md border text-sm font-bold ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </div>
                        </div>

                        {category.description && (
                          <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                            {
                              category.description
                            }
                          </p>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium">
              Professional Bio
            </label>

            <textarea
              name="bio"
              value={
                formData.bio
              }
              onChange={
                handleChange
              }
              rows="5"
              maxLength="1000"
              placeholder="Tell customers about your experience and expertise..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {
                formData.bio.length
              }
              /1000
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </div>

        {/* Right panel */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Provider Stats
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Rating
                </span>

                <span className="font-semibold">
                  ⭐{" "}
                  {Number(
                    profile?.averageRating ||
                      0
                  ).toFixed(1)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Reviews
                </span>

                <span className="font-semibold">
                  {
                    profile?.totalReviews ||
                    0
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Completed Jobs
                </span>

                <span className="font-semibold">
                  {
                    profile?.completedJobs ||
                    0
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Services
                </span>

                <span className="font-semibold">
                  {
                    formData
                      .servicesOffered
                      .length
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Verification
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Complete your professional profile before
              submitting it for admin verification.
            </p>

            {profile?.verificationStatus ===
              "verified" && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-center">
                <p className="font-semibold text-green-700">
                  ✓ Provider Verified
                </p>
              </div>
            )}

            {profile?.verificationStatus ===
              "pending" && (
              <div className="mt-5 rounded-xl bg-yellow-50 p-4 text-center">
                <p className="font-semibold text-yellow-700">
                  Verification Pending
                </p>

                <p className="mt-1 text-xs text-yellow-600">
                  An administrator will review your profile.
                </p>
              </div>
            )}

            {profile?.verificationStatus !==
              "verified" &&
              profile?.verificationStatus !==
                "pending" && (
              <button
                type="button"
                onClick={
                  handleVerification
                }
                disabled={
                  submittingVerification
                }
                className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingVerification
                  ? "Submitting..."
                  : "Submit for Verification"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProviderProfile;