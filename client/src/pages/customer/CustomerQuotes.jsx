import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getCustomerQuotes,
  acceptQuote,
  rejectQuote,
} from "../../services/quoteService";

const CustomerQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCustomerQuotes();

      setQuotes(response.quotes || []);
    } catch (err) {
      console.error("Customer quotes error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load quotes.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleAccept = async (quoteId) => {
    const confirmed = window.confirm(
      "Accept this quote and book the service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(quoteId);

      const response = await acceptQuote(quoteId);

      toast.success(
        response.message ||
          "Quote accepted successfully."
      );

      await fetchQuotes();
    } catch (err) {
      console.error("Accept quote error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to accept quote."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (quoteId) => {
    const confirmed = window.confirm(
      "Reject this quote?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(quoteId);

      const response = await rejectQuote(quoteId);

      toast.success(
        response.message ||
          "Quote rejected successfully."
      );

      await fetchQuotes();
    } catch (err) {
      console.error("Reject quote error:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to reject quote."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClasses = (status) => {
    const classes = {
      pending:
        "bg-yellow-100 text-yellow-700",
      accepted:
        "bg-green-100 text-green-700",
      rejected:
        "bg-red-100 text-red-700",
      expired:
        "bg-slate-100 text-slate-700",
      withdrawn:
        "bg-slate-100 text-slate-700",
    };

    return (
      classes[status] ||
      "bg-slate-100 text-slate-700"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your quotes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Quotes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review quotes submitted by service providers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQuotes}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {quotes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            💰
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No quotes yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Provider quotes for your service requests
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {quotes.map((quote) => {
            const request = quote.serviceRequest;
            const provider = quote.provider;

            const isPending =
              quote.status === "pending";

            const isProcessing =
              processingId === quote._id;

            return (
              <div
                key={quote._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Quote Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        {request?.title ||
                          "Service Request"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          quote.status
                        )}`}
                      >
                        {quote.status
                          ? quote.status
                              .charAt(0)
                              .toUpperCase() +
                            quote.status.slice(1)
                          : "Unknown"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Quote ID: {quote._id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-5 py-3 text-right shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Quote Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      ₹{quote.amount}
                    </p>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3">
                  {/* Provider */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service Provider
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                          {provider?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {provider?.name ||
                              "Service Provider"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {provider?.email || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        <p className="text-sm text-slate-500">
                          📞 {provider?.phone || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service Details
                    </p>

                    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Category
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          {request?.serviceCategory
                            ?.name || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Estimated Duration
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          ⏱️{" "}
                          {quote.estimatedDuration}{" "}
                          {quote.estimatedDuration === 1
                            ? "hour"
                            : "hours"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Preferred Date
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          📅{" "}
                          {formatDate(
                            request?.preferredDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Time Slot
                        </p>

                        <p className="text-sm font-semibold capitalize text-slate-800">
                          {request?.preferredTimeSlot ||
                            "Anytime"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service Location
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-800">
                        📍{" "}
                        {request?.location?.address ||
                          "Address not available"}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {request?.location?.city ||
                          "—"}
                        ,{" "}
                        {request?.location?.state ||
                          "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {request?.location?.pincode ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                {request?.description && (
                  <div className="mx-5 mb-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Problem Description
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {request.description}
                    </p>
                  </div>
                )}

                {/* Provider Notes */}
                {quote.notes && (
                  <div className="mx-5 mb-5 rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Provider Notes
                    </p>

                    <p className="mt-2 text-sm text-blue-900">
                      {quote.notes}
                    </p>
                  </div>
                )}

                {/* Pending Actions */}
                {isPending && (
                  <div className="flex flex-col gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleReject(quote._id)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ❌{" "}
                      {isProcessing
                        ? "Processing..."
                        : "Reject Quote"}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleAccept(quote._id)
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ✅{" "}
                      {isProcessing
                        ? "Processing..."
                        : "Accept & Book"}
                    </button>
                  </div>
                )}

                {/* Accepted */}
                {quote.status === "accepted" && (
                  <div className="flex items-center gap-3 border-t border-green-200 bg-green-50 p-5">
                    <div className="text-2xl">
                      ✅
                    </div>

                    <div>
                      <p className="font-semibold text-green-800">
                        Booking confirmed
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        You accepted this quote. The
                        service request is now booked.
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {quote.status === "rejected" && (
                  <div className="flex items-center gap-3 border-t border-red-200 bg-red-50 p-5">
                    <div className="text-2xl">
                      ❌
                    </div>

                    <div>
                      <p className="font-semibold text-red-800">
                        Quote rejected
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        This quote was rejected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerQuotes;