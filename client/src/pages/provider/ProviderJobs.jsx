import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getProviderBookings,
  startBooking,
  completeBooking,
} from "../../services/bookingService";

const ProviderJobs = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState(null);

  const [completionNotes, setCompletionNotes] =
    useState("");

  const [showCompleteForm, setShowCompleteForm] =
    useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response =
        await getProviderBookings();

      setBookings(response.bookings || []);
    } catch (error) {
      console.error(
        "Provider bookings error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStartJob = async (bookingId) => {
    const confirmed = window.confirm(
      "Start this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(bookingId);

      const response =
        await startBooking(bookingId);

      toast.success(
        response.message ||
          "Job started successfully."
      );

      await fetchBookings();
    } catch (error) {
      console.error(
        "Start job error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to start job."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteJob = async (
    bookingId
  ) => {
    if (!completionNotes.trim()) {
      toast.error(
        "Please enter completion notes."
      );

      return;
    }

    try {
      setProcessingId(bookingId);

      const response =
        await completeBooking(
          bookingId,
          completionNotes.trim()
        );

      toast.success(
        response.message ||
          "Job completed successfully."
      );

      setCompletionNotes("");
      setShowCompleteForm(null);

      await fetchBookings();
    } catch (error) {
      console.error(
        "Complete job error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to complete job."
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

  const getStatusClasses = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "in_progress":
        return "bg-yellow-100 text-yellow-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";

      case "in_progress":
        return "In Progress";

      case "completed":
        return "Completed";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your jobs...
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
            My Jobs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your scheduled and active service
            jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Empty */}
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🔧
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No jobs assigned
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your booked service jobs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const request =
              booking.serviceRequest;

            const customer =
              booking.customer;

            const isProcessing =
              processingId === booking._id;

            return (
              <div
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        {request?.title ||
                          "Service Job"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          booking.status
                        )}`}
                      >
                        {getStatusLabel(
                          booking.status
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Booking ID: {booking._id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-5 py-3 text-right shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Job Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      ₹{booking.amount}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-3">
                  {/* Customer */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">
                        {customer?.name ||
                          "Customer"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {customer?.email || "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        📞{" "}
                        {customer?.phone || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Schedule
                    </p>

                    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4">
                      <div>
                        <p className="text-xs text-slate-400">
                          Date
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          📅{" "}
                          {formatDate(
                            booking.scheduledDate
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Time Slot
                        </p>

                        <p className="text-sm font-semibold capitalize text-slate-800">
                          🕐{" "}
                          {booking.timeSlot ||
                            "Anytime"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Duration
                        </p>

                        <p className="text-sm font-semibold text-slate-800">
                          ⏱️{" "}
                          {booking.estimatedDuration}{" "}
                          {booking.estimatedDuration ===
                          1
                            ? "hour"
                            : "hours"}
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
                        {booking.location?.address ||
                          "—"}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {booking.location?.city ||
                          "—"}
                        ,{" "}
                        {booking.location?.state ||
                          "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.location?.pincode ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request description */}
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

                {/* Started information */}
                {booking.startedAt && (
                  <div className="mx-5 mb-5 rounded-xl bg-yellow-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                      Job Started
                    </p>

                    <p className="mt-1 text-sm text-yellow-900">
                      {formatDateTime(
                        booking.startedAt
                      )}
                    </p>
                  </div>
                )}

                {/* Completed information */}
                {booking.completedAt && (
                  <div className="mx-5 mb-5 rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Job Completed
                    </p>

                    <p className="mt-1 text-sm text-green-900">
                      {formatDateTime(
                        booking.completedAt
                      )}
                    </p>

                    {booking.completionNotes && (
                      <p className="mt-2 text-sm text-green-800">
                        {booking.completionNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Scheduled */}
                {booking.status ===
                  "scheduled" && (
                  <div className="border-t border-slate-200 p-5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        handleStartJob(
                          booking._id
                        )
                      }
                      className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      🚀{" "}
                      {isProcessing
                        ? "Starting..."
                        : "Start Job"}
                    </button>
                  </div>
                )}

                {/* In progress */}
                {booking.status ===
                  "in_progress" && (
                  <div className="border-t border-slate-200 p-5">
                    {showCompleteForm ===
                    booking._id ? (
                      <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">
                            Completion Notes
                          </label>

                          <textarea
                            value={
                              completionNotes
                            }
                            onChange={(event) =>
                              setCompletionNotes(
                                event.target.value
                              )
                            }
                            rows={4}
                            maxLength={1000}
                            placeholder="Describe the work completed..."
                            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              completionNotes.length
                            }
                            /1000
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            disabled={
                              isProcessing
                            }
                            onClick={() =>
                              handleCompleteJob(
                                booking._id
                              )
                            }
                            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Completing..."
                              : "✅ Mark Job Completed"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              isProcessing
                            }
                            onClick={() => {
                              setShowCompleteForm(
                                null
                              );
                              setCompletionNotes(
                                ""
                              );
                            }}
                            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setShowCompleteForm(
                            booking._id
                          )
                        }
                        className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        ✅ Complete Job
                      </button>
                    )}
                  </div>
                )}

                {/* Completed */}
                {booking.status ===
                  "completed" && (
                  <div className="border-t border-green-200 bg-green-50 p-5">
                    <p className="font-semibold text-green-800">
                      ✅ Job completed successfully
                    </p>

                    <p className="mt-1 text-sm text-green-700">
                      This service job has been completed.
                    </p>
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

export default ProviderJobs;