import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
  getRequestById,
  cancelRequest,
  classifyRequestWithAI,
  getMatchingProviders,
  selectProvider,
} from "../../services/serviceRequestService";

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] =
    useState(false);
  const [providerSelectionLoading, setProviderSelectionLoading] =
    useState(false);
  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [providerMatches, setProviderMatches] =
    useState([]);

  const [matchingCompleted, setMatchingCompleted] =
    useState(false);

  const [providersChecked, setProvidersChecked] =
    useState(0);

  const loadRequest = async () => {
    try {
      setLoading(true);

      const response = await getRequestById(id);

      setRequest(
        response.data || response.request
      );
    } catch (error) {
      console.error(
        "Error loading request:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load service request."
      );

      navigate(
        "/dashboard/customer/requests",
        { replace: true }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const handleAIClassification = async () => {
    try {
      setAiLoading(true);

      const response =
        await classifyRequestWithAI(id);

      toast.success(
        "AI analysis completed successfully."
      );

      const updatedRequest =
        response.data?.request ||
        response.request;

      if (updatedRequest) {
        setRequest(updatedRequest);
      } else {
        await loadRequest();
      }

      setProviderMatches([]);
      setMatchingCompleted(false);
    } catch (error) {
      console.error(
        "AI classification error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "AI analysis failed. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleFindProviders = async () => {
    try {
      setMatchingLoading(true);

      const response =
        await getMatchingProviders(id);

      const data = response.data || {};

      setProviderMatches(
        data.providers || []
      );

      setProvidersChecked(
        data.totalProvidersChecked || 0
      );

      setMatchingCompleted(true);

      toast.success(
        `Found ${
          data.totalMatches || 0
        } matching provider${
          data.totalMatches === 1
            ? ""
            : "s"
        }.`
      );
    } catch (error) {
      console.error(
        "Provider matching error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to find matching providers."
      );
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleSelectProvider = async (
    providerId,
    providerName
  ) => {
    const confirmed = window.confirm(
      `Select ${providerName} for this service request?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProviderSelectionLoading(true);

      const response =
        await selectProvider(
          id,
          providerId
        );

      toast.success(
        response.message ||
          "Provider selected successfully."
      );

      const updatedRequest =
        response.data?.request;

      if (updatedRequest) {
        setRequest(updatedRequest);
      } else {
        await loadRequest();
      }

      setMatchingCompleted(false);
      setProviderMatches([]);
    } catch (error) {
      console.error(
        "Provider selection error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to select provider."
      );
    } finally {
      setProviderSelectionLoading(false);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this service request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);

      const response =
        await cancelRequest(id);

      toast.success(
        response.message ||
          "Service request cancelled successfully."
      );

      await loadRequest();

      setProviderMatches([]);
      setMatchingCompleted(false);
    } catch (error) {
      console.error(
        "Cancel request error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to cancel service request."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatLabel = (value) => {
    if (!value) {
      return "Not specified";
    }

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";

      case "matching":
        return "bg-purple-100 text-purple-700";

      case "quoted":
        return "bg-amber-100 text-amber-700";

      case "booked":
        return "bg-indigo-100 text-indigo-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getUrgencyClasses = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-slate-100 text-slate-700";

      case "normal":
        return "bg-blue-100 text-blue-700";

      case "high":
        return "bg-orange-100 text-orange-700";

      case "emergency":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getConfidencePercentage = (
    confidence
  ) => {
    const numericConfidence =
      Number(confidence);

    if (
      Number.isNaN(numericConfidence)
    ) {
      return 0;
    }

    return Math.round(
      numericConfidence * 100
    );
  };

  const getScoreClasses = (score) => {
    if (score >= 85) {
      return "text-green-700 bg-green-50 border-green-200";
    }

    if (score >= 70) {
      return "text-blue-700 bg-blue-50 border-blue-200";
    }

    if (score >= 50) {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }

    return "text-slate-700 bg-slate-50 border-slate-200";
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading request...
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            Request not found
          </h2>

          <Link
            to="/dashboard/customer/requests"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  const aiClassification =
    request.aiClassification;

  const isAIProcessed =
    aiClassification?.processed === true;

  const hasSelectedProvider =
    Boolean(request.assignedProvider);

  const categoryName =
    request.serviceCategory?.name ||
    "Not specified";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/dashboard/customer/requests"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to My Requests
            </Link>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {request.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  request.status
                )}`}
              >
                {formatLabel(
                  request.status
                )}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Request ID: {request._id}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {request.status ===
              "open" && (
              <Link
                to={`/dashboard/customer/requests/${request._id}/edit`}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit Request
              </Link>
            )}

            {[
              "open",
              "matching",
              "quoted",
            ].includes(
              request.status
            ) && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelLoading}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLoading
                  ? "Cancelling..."
                  : "Cancel Request"}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Problem Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Problem Description
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {request.description}
              </p>
            </section>

            {/* Service Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Service Information
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {categoryName}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Base Price
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {request.serviceCategory?.basePrice != null
                      ? `₹${request.serviceCategory.basePrice}`
                      : "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Pricing Unit
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatLabel(
                      request.serviceCategory
                        ?.pricingUnit
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your Budget
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {request.budget != null
                      ? `₹${request.budget}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </section>

            {/* AI Analysis */}
            <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
              <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                      ✨
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        AI Analysis
                      </h2>

                      <p className="text-sm text-slate-500">
                        Gemini-powered service classification
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isAIProcessed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isAIProcessed
                      ? "✓ Processed"
                      : "Pending"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {!isAIProcessed ? (
                  <div>
                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="text-sm leading-6 text-slate-600">
                        AI can analyze your request and automatically identify the most appropriate service category, required skills, urgency and confidence.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAIClassification
                      }
                      disabled={aiLoading}
                      className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aiLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Analyzing Request...
                        </>
                      ) : (
                        <>✨ Run AI Analysis</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">

                    {/* Category + Urgency */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          AI Category
                        </p>

                        <p className="mt-2 text-lg font-bold text-blue-700">
                          {request.serviceCategory?.name ||
                            "Not available"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          AI Urgency
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getUrgencyClasses(
                            request.urgency
                          )}`}
                        >
                          {formatLabel(
                            request.urgency
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="rounded-xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          AI Confidence
                        </p>

                        <p className="text-sm font-bold text-blue-700">
                          {getConfidencePercentage(
                            aiClassification?.confidence
                          )}
                          %
                        </p>
                      </div>

                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${getConfidencePercentage(
                              aiClassification?.confidence
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="rounded-xl border border-slate-200 p-5">
                      <p className="text-sm font-semibold text-slate-700">
                        Required Skills
                      </p>

                      {Array.isArray(
                        aiClassification?.requiredSkills
                      ) &&
                      aiClassification.requiredSkills
                        .length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {aiClassification.requiredSkills.map(
                            (skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          No specific skills were identified.
                        </p>
                      )}
                    </div>

                    {/* AI Summary */}
                    <div className="rounded-xl bg-blue-50 p-5">
                      <p className="text-sm font-semibold text-blue-900">
                        AI Summary
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-800">
                        The AI classification has been completed successfully. The detected service category is{" "}
                        <strong>
                          {request.serviceCategory?.name ||
                            "not available"}
                        </strong>{" "}
                        with{" "}
                        <strong>
                          {getConfidencePercentage(
                            aiClassification?.confidence
                          )}
                          %
                        </strong>{" "}
                        confidence.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleAIClassification
                      }
                      disabled={aiLoading}
                      className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aiLoading
                        ? "Re-analyzing..."
                        : "Run AI Analysis Again"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Provider Matching */}
            <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
              <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-xl text-white">
                      👨‍🔧
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Recommended Service Providers
                      </h2>

                      <p className="text-sm text-slate-500">
                        Providers matched using your service requirements
                      </p>
                    </div>
                  </div>

                  {matchingCompleted && (
                    <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                      ✓ Matching Complete
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">

                {/* Already Selected */}
                {hasSelectedProvider ? (
                  <div className="space-y-5">

                    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                          ✓
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                            Provider Selected
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-green-900">
                            {
                              request
                                .assignedProvider
                                ?.name
                            }
                          </h3>

                          <p className="mt-1 text-sm text-green-700">
                            Your selected service provider has been assigned to this request.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Provider Email
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {request
                            .assignedProvider
                            ?.email ||
                            "Not available"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Provider Phone
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {request
                            .assignedProvider
                            ?.phone ||
                            "Not available"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-5">
                      <p className="text-sm font-semibold text-blue-900">
                        Next Step
                      </p>

                      <p className="mt-1 text-sm leading-6 text-blue-800">
                        The provider selection is complete. The quotation and booking workflow will be handled in the next phase.
                      </p>
                    </div>
                  </div>
                ) : !isAIProcessed ? (
                  <div className="rounded-xl bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-800">
                      AI classification is required first.
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      Run AI Analysis above before finding suitable service providers.
                    </p>
                  </div>
                ) : !matchingCompleted ? (
                  <div>
                    <div className="rounded-xl bg-slate-50 p-5">
                      <p className="text-sm leading-6 text-slate-600">
                        CareConnect will compare verified providers based on service category, required skills, service area, ratings and completed jobs.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleFindProviders
                      }
                      disabled={matchingLoading}
                      className="mt-5 inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {matchingLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Finding Providers...
                        </>
                      ) : (
                        <>
                          👨‍🔧 Find Matching Providers
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>

                    <div className="mb-5 flex flex-col gap-2 rounded-xl bg-purple-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-900">
                          Provider Matching Results
                        </p>

                        <p className="mt-1 text-xs text-purple-700">
                          Checked{" "}
                          {providersChecked}{" "}
                          verified provider
                          {providersChecked === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleFindProviders
                        }
                        disabled={
                          matchingLoading
                        }
                        className="rounded-lg border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                      >
                        {matchingLoading
                          ? "Refreshing..."
                          : "Refresh Matches"}
                      </button>
                    </div>

                    {providerMatches.length ===
                    0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                        <div className="text-4xl">
                          🔍
                        </div>

                        <h3 className="mt-3 font-semibold text-slate-900">
                          No matching providers found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                          No verified provider currently matches the service category and requirements for this request.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">

                        {providerMatches.map(
                          (match, index) => {
                            const score =
                              Number(
                                match.match?.score
                              ) || 0;

                            const provider =
                              match.provider ||
                              {};

                            const profile =
                              match.profile ||
                              {};

                            return (
                              <div
                                key={
                                  provider.id ||
                                  profile.id ||
                                  index
                                }
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                              >
                                <div className="flex flex-col gap-5">

                                  {/* Provider Header */}
                                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-700">
                                        {provider.name
                                          ?.charAt(
                                            0
                                          )
                                          ?.toUpperCase() ||
                                          "P"}
                                      </div>

                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h3 className="text-base font-bold text-slate-900">
                                            {provider.name ||
                                              "Service Provider"}
                                          </h3>

                                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                                            ✓ Verified
                                          </span>
                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                          {profile.experience ||
                                            0}{" "}
                                          years experience
                                        </p>
                                      </div>
                                    </div>

                                    {/* Match Score */}
                                    <div
                                      className={`rounded-xl border px-4 py-3 text-center ${getScoreClasses(
                                        score
                                      )}`}
                                    >
                                      <p className="text-[10px] font-semibold uppercase tracking-wide">
                                        Match Score
                                      </p>

                                      <p className="mt-1 text-2xl font-bold">
                                        {Math.round(
                                          score
                                        )}
                                        %
                                      </p>
                                    </div>
                                  </div>

                                  {/* Score Bar */}
                                  <div>
                                    <div className="mb-2 flex items-center justify-between">
                                      <p className="text-xs font-semibold text-slate-500">
                                        Overall Match
                                      </p>

                                      <p className="text-xs font-bold text-slate-700">
                                        {score.toFixed(
                                          1
                                        )}
                                        / 100
                                      </p>
                                    </div>

                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                      <div
                                        className="h-full rounded-full bg-purple-600 transition-all"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.max(
                                              0,
                                              score
                                            )
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Matching Factors */}
                                  <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Skills Match
                                      </p>

                                      <p className="mt-1 text-lg font-bold text-slate-900">
                                        {match.match
                                          ?.skillMatchPercentage ||
                                          0}
                                        %
                                      </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Service Area
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-slate-900">
                                        {match.match
                                          ?.areaMatch
                                          ? "✓ Matched"
                                          : "Not Matched"}
                                      </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Rating
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-slate-900">
                                        ⭐{" "}
                                        {Number(
                                          profile.averageRating ||
                                            0
                                        ).toFixed(
                                          1
                                        )}
                                        /5
                                      </p>
                                    </div>
                                  </div>

                                  {/* Matched Skills */}
                                  <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                      Matched Skills
                                    </p>

                                    {Array.isArray(
                                      match.match
                                        ?.matchedSkills
                                    ) &&
                                    match.match
                                      .matchedSkills
                                      .length > 0 ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {match.match.matchedSkills.map(
                                          (
                                            skill,
                                            skillIndex
                                          ) => (
                                            <span
                                              key={`${skill}-${skillIndex}`}
                                              className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                                            >
                                              ✓{" "}
                                              {formatLabel(
                                                skill
                                              )}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <p className="mt-2 text-sm text-slate-500">
                                        No skills matched.
                                      </p>
                                    )}
                                  </div>

                                  {/* Missing Skills */}
                                  {Array.isArray(
                                    match.match
                                      ?.missingSkills
                                  ) &&
                                  match.match
                                    .missingSkills
                                    .length > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-slate-700">
                                        Skills Not Found
                                      </p>

                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {match.match.missingSkills.map(
                                          (
                                            skill,
                                            skillIndex
                                          ) => (
                                            <span
                                              key={`${skill}-${skillIndex}`}
                                              className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                                            >
                                              {formatLabel(
                                                skill
                                              )}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Provider Info */}
                                  <div className="border-t border-slate-100 pt-4">
                                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                          Completed Jobs
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {profile.completedJobs ||
                                            0}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                          Reviews
                                        </p>

                                        <p className="mt-1 font-semibold text-slate-800">
                                          {profile.totalReviews ||
                                            0}
                                        </p>
                                      </div>

                                      <div className="sm:col-span-2">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                          Service Areas
                                        </p>

                                        <p className="mt-1 text-slate-600">
                                          {Array.isArray(
                                            profile.serviceAreas
                                          ) &&
                                          profile
                                            .serviceAreas
                                            .length > 0
                                            ? profile.serviceAreas.join(
                                                ", "
                                              )
                                            : "Not specified"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Select Provider */}
                                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        Want to use this provider?
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        Selecting this provider will assign them to your service request.
                                      </p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectProvider(
                                          provider.id,
                                          provider.name ||
                                            "this provider"
                                        )
                                      }
                                      disabled={
                                        providerSelectionLoading
                                      }
                                      className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {providerSelectionLoading ? (
                                        <>
                                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          Selecting...
                                        </>
                                      ) : (
                                        "Select Provider"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Service Location
              </h2>

              <div className="mt-4 rounded-xl bg-slate-50 p-5">
                <p className="font-medium text-slate-800">
                  {request.location?.address ||
                    "Address not available"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {request.location?.city},{" "}
                  {request.location?.state} -{" "}
                  {request.location?.pincode}
                </p>
              </div>
            </section>

            {/* Preferred Schedule */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Preferred Schedule
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Preferred Date
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatDate(
                      request.preferredDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Preferred Time
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {formatLabel(
                      request.preferredTimeSlot
                    )}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Request Status */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Request Status
              </h2>

              <div className="mt-5">
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses(
                    request.status
                  )}`}
                >
                  {formatLabel(
                    request.status
                  )}
                </span>
              </div>

              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Urgency
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getUrgencyClasses(
                      request.urgency
                    )}`}
                  >
                    {formatLabel(
                      request.urgency
                    )}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateTime(
                      request.createdAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {formatDateTime(
                      request.updatedAt
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Selected Provider */}
            <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-sm font-bold text-green-900">
                👨‍🔧 Assigned Provider
              </p>

              {hasSelectedProvider ? (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                      {request.assignedProvider?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "P"}
                    </div>

                    <div>
                      <p className="font-semibold text-green-900">
                        {
                          request
                            .assignedProvider
                            ?.name
                        }
                      </p>

                      <p className="text-xs text-green-700">
                        Selected Provider
                      </p>
                    </div>
                  </div>

                  {request.assignedProvider
                    ?.phone && (
                    <p className="mt-4 text-sm text-green-800">
                      📞{" "}
                      {
                        request
                          .assignedProvider
                          .phone
                      }
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-green-800">
                  No provider has been selected yet.
                </p>
              )}
            </section>

            {/* AI Status */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-bold text-blue-900">
                🤖 AI Service Classification
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                CareConnect uses AI to understand the customer's problem and prepare the request for intelligent provider matching.
              </p>

              <div className="mt-4 text-xs text-blue-700">
                Status:{" "}
                <strong>
                  {isAIProcessed
                    ? "Processed"
                    : "Pending"}
                </strong>
              </div>
            </section>

            {/* Matching Status */}
            <section className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
              <p className="text-sm font-bold text-purple-900">
                👨‍🔧 Provider Matching
              </p>

              <p className="mt-2 text-sm leading-6 text-purple-800">
                Verified providers are compared using category, skills, service area, ratings and completed jobs.
              </p>

              <div className="mt-4 text-xs text-purple-700">
                Status:{" "}
                <strong>
                  {hasSelectedProvider
                    ? "Provider Selected"
                    : matchingCompleted
                    ? "Completed"
                    : "Not started"}
                </strong>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;