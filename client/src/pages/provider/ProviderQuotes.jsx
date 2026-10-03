import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  getProviderRequests,
  createQuote,
} from "../../services/quoteService";

const ProviderQuotes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [formData, setFormData] = useState({});

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response = await getProviderRequests();

      console.log("Provider requests response:", response);

      setItems(response?.requests || []);
    } catch (error) {
      console.error("Provider requests error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load assigned requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleChange = (requestId, field, value) => {
    setFormData((previous) => ({
      ...previous,
      [requestId]: {
        ...previous[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (requestId) => {
    const data = formData[requestId] || {};

    const amount = Number(data.amount);
    const estimatedDuration = Number(
      data.estimatedDuration
    );

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid quote amount.");
      return;
    }

    if (!estimatedDuration || estimatedDuration <= 0) {
      toast.error(
        "Please enter a valid estimated duration."
      );
      return;
    }

    try {
      setSubmittingId(requestId);

      const response = await createQuote({
        serviceRequestId: requestId,
        amount,
        estimatedDuration,
        notes: data.notes || "",
      });

      toast.success(
        response.message ||
          "Quote submitted successfully."
      );

      setFormData((previous) => {
        const updated = { ...previous };
        delete updated[requestId];
        return updated;
      });

      await loadRequests();
    } catch (error) {
      console.error("Submit quote error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to submit quote."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading assigned requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard/provider"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Provider Dashboard
          </Link>

          <div className="mt-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              My Quotes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review assigned service requests and submit
              quotations to customers.
            </p>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📋</div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              No assigned requests
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              You currently have no service requests
              assigned to you that require a quotation.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              /*
               * IMPORTANT:
               *
               * Backend returns the service request itself:
               *
               * {
               *   _id,
               *   title,
               *   customer,
               *   serviceCategory,
               *   location,
               *   quote
               * }
               *
               * Therefore item IS the request.
               */
              const request = item;

              const quote = item.quote || null;

              if (!request?._id) {
                return null;
              }

              const current =
                formData[request._id] || {};

              return (
                <section
                  key={request._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Request Header */}
                  <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">
                            {request.title ||
                              "Service Request"}
                          </h2>

                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold capitalize text-purple-700">
                            {request.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Request ID: {request._id}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Customer Budget
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          ₹{request.budget || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid gap-6 lg:grid-cols-2">

                      {/* Request Information */}
                      <div className="space-y-5">

                        {/* Customer */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {request.customer?.name ||
                              "Customer"}
                          </p>

                          {request.customer?.phone && (
                            <p className="mt-1 text-sm text-slate-500">
                              {request.customer.phone}
                            </p>
                          )}
                        </div>

                        {/* Category */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Service Category
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {request.serviceCategory?.name ||
                              "Service"}
                          </p>
                        </div>

                        {/* Description */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Problem
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {request.description ||
                              "No description provided."}
                          </p>
                        </div>

                        {/* Location */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Service Location
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {request.location?.address && (
                              <>
                                {request.location.address}
                                <br />
                              </>
                            )}

                            {request.location?.city &&
                              `${request.location.city}, `}

                            {request.location?.state &&
                              `${request.location.state}`}

                            {request.location?.pincode &&
                              ` - ${request.location.pincode}`}
                          </p>
                        </div>

                        {/* Date & Time */}
                        <div className="grid gap-4 sm:grid-cols-2">

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Preferred Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {request.preferredDate
                                ? new Date(
                                    request.preferredDate
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "Not specified"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Time Slot
                            </p>

                            <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                              {request.preferredTimeSlot ||
                                "Not specified"}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Quote Section */}
                      <div>
                        {quote ? (
                          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">

                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
                                ✓
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                  Quote Submitted
                                </p>

                                <h3 className="text-lg font-bold text-green-900">
                                  ₹{quote.amount}
                                </h3>
                              </div>
                            </div>

                            <div className="mt-5 space-y-4">

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                  Estimated Duration
                                </p>

                                <p className="mt-1 font-semibold text-green-900">
                                  {
                                    quote.estimatedDuration
                                  }{" "}
                                  hour
                                  {quote.estimatedDuration ===
                                  1
                                    ? ""
                                    : "s"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                  Status
                                </p>

                                <span className="mt-1 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-green-700">
                                  {quote.status}
                                </span>
                              </div>

                              {quote.notes && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                    Notes
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-green-800">
                                    {quote.notes}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-slate-200 p-6">

                            <div className="mb-5">
                              <h3 className="text-lg font-bold text-slate-900">
                                Submit Your Quote
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Provide the price and estimated
                                time required to complete this
                                service.
                              </p>
                            </div>

                            <div className="space-y-5">

                              {/* Amount */}
                              <div>
                                <label
                                  htmlFor={`amount-${request._id}`}
                                  className="block text-sm font-semibold text-slate-700"
                                >
                                  Quote Amount (₹)
                                </label>

                                <input
                                  id={`amount-${request._id}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={
                                    current.amount || ""
                                  }
                                  onChange={(event) =>
                                    handleChange(
                                      request._id,
                                      "amount",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Example: 650"
                                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              {/* Duration */}
                              <div>
                                <label
                                  htmlFor={`duration-${request._id}`}
                                  className="block text-sm font-semibold text-slate-700"
                                >
                                  Estimated Duration
                                  (hours)
                                </label>

                                <input
                                  id={`duration-${request._id}`}
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={
                                    current.estimatedDuration ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleChange(
                                      request._id,
                                      "estimatedDuration",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Example: 2"
                                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              {/* Notes */}
                              <div>
                                <label
                                  htmlFor={`notes-${request._id}`}
                                  className="block text-sm font-semibold text-slate-700"
                                >
                                  Notes
                                </label>

                                <textarea
                                  id={`notes-${request._id}`}
                                  rows="5"
                                  maxLength="1000"
                                  value={
                                    current.notes || ""
                                  }
                                  onChange={(event) =>
                                    handleChange(
                                      request._id,
                                      "notes",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Explain the work, parts required, inspection details, or any other information for the customer."
                                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              {/* Submit */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleSubmit(
                                    request._id
                                  )
                                }
                                disabled={
                                  submittingId ===
                                  request._id
                                }
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {submittingId ===
                                request._id
                                  ? "Submitting Quote..."
                                  : "Submit Quote"}
                              </button>

                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderQuotes;