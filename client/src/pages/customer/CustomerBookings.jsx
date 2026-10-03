import { useEffect, useState } from "react";

import {
  getCustomerBookings,
} from "../../services/bookingService";

import {
  createReview,
  getCustomerReviews,
} from "../../services/reviewService";

const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewingBooking, setReviewingBooking] =
    useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getCustomerBookings();

      setBookings(response.bookings || []);
    } catch (err) {
      console.error(
        "Fetch customer bookings error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response =
        await getCustomerReviews();

      setReviews(response.reviews || []);
    } catch (err) {
      console.error(
        "Fetch customer reviews error:",
        err
      );
    }
  };

  const fetchData = async () => {
    await Promise.all([
      fetchBookings(),
      fetchReviews(),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getReviewForBooking = (bookingId) => {
    return reviews.find(
      (review) =>
        review.booking?._id === bookingId ||
        review.booking === bookingId
    );
  };

  const openReviewForm = (booking) => {
    setReviewingBooking(booking);
    setRating(0);
    setComment("");
    setReviewMessage("");
  };

  const closeReviewForm = () => {
    if (submittingReview) {
      return;
    }

    setReviewingBooking(null);
    setRating(0);
    setComment("");
    setReviewMessage("");
  };

  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!reviewingBooking) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewMessage(
        "Please select a rating between 1 and 5 stars."
      );

      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage("");

      const response = await createReview({
        bookingId: reviewingBooking._id,
        rating,
        comment,
      });

      setReviewMessage(
        response.message ||
          "Review submitted successfully."
      );

      await fetchReviews();

      setTimeout(() => {
        setReviewingBooking(null);
        setRating(0);
        setComment("");
        setReviewMessage("");
      }, 1000);
    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );

      setReviewMessage(
        err.response?.data?.message ||
          "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "in_progress":
        return "bg-amber-100 text-amber-700";

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
        return status || "Unknown";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
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

  const formatTimeSlot = (slot) => {
    switch (slot) {
      case "morning":
        return "Morning";

      case "afternoon":
        return "Afternoon";

      case "evening":
        return "Evening";

      case "anytime":
        return "Anytime";

      default:
        return slot || "Not specified";
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading your bookings...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Bookings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your home service bookings and
              review completed jobs.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            🔄 Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchData}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!error && bookings.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📅
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No bookings yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your accepted service bookings will
              appear here.
            </p>
          </div>
        )}

        {/* BOOKINGS */}

        <div className="space-y-6">
          {bookings.map((booking) => {
            const request =
              booking.serviceRequest;

            const category =
              booking.serviceCategory ||
              request?.serviceCategory;

            const provider =
              booking.provider;

            const existingReview =
              getReviewForBooking(
                booking._id
              );

            return (
              <div
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* TOP */}

                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">
                          {request?.title ||
                            category?.name ||
                            "Service Booking"}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(
                            booking.status
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Booking ID: {booking._id}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-5 py-3 text-right shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Booking Amount
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        ₹
                        {Number(
                          booking.amount || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MAIN INFORMATION */}

                <div className="grid gap-6 p-6 lg:grid-cols-3">
                  {/* PROVIDER */}

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service Provider
                    </p>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {provider?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "P"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {provider?.name ||
                              "Provider"}
                          </p>

                          <p className="text-sm text-slate-500">
                            {provider?.email ||
                              "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      {provider?.phone && (
                        <p className="mt-4 text-sm text-slate-600">
                          📞 {provider.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SCHEDULE */}

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Schedule
                    </p>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
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

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            🕐{" "}
                            {formatTimeSlot(
                              booking.timeSlot
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ⏱️{" "}
                            {
                              booking.estimatedDuration
                            }{" "}
                            hour
                            {booking.estimatedDuration !==
                            1
                              ? "s"
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}

                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service Location
                    </p>

                    <div className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-semibold text-slate-800">
                        📍{" "}
                        {booking.location?.address ||
                          "Address unavailable"}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {booking.location?.city},{" "}
                        {booking.location?.state}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.location?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SERVICE DETAILS */}

                <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Service Details
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {category?.name ||
                      "Service category"}
                  </p>

                  {request?.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {request.description}
                    </p>
                  )}
                </div>

                {/* TIMELINE */}

                <div className="border-t border-slate-200 px-6 py-6">
                  <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Job Timeline
                  </p>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        📅
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          Booking Scheduled
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Booking created on{" "}
                          {formatDateTime(
                            booking.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {booking.startedAt && (
                      <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          🔧
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            Job Started
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateTime(
                              booking.startedAt
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.completedAt && (
                      <div className="flex gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          ✅
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            Job Completed
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateTime(
                              booking.completedAt
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* COMPLETION NOTES */}

                {booking.completionNotes && (
                  <div className="border-t border-slate-200 px-6 py-6">
                    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Provider Completion Notes
                      </p>

                      <p className="mt-2 text-sm leading-6 text-green-900">
                        {booking.completionNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* REVIEW SECTION */}

                {booking.status ===
                  "completed" && (
                  <div className="border-t border-slate-200 px-6 py-6">
                    {existingReview ? (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
                              Your Review
                            </p>

                            <div className="mt-2 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <=
                                      existingReview.rating
                                        ? "text-xl text-yellow-500"
                                        : "text-xl text-slate-300"
                                    }
                                  >
                                    ★
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Review Submitted
                          </span>
                        </div>

                        {existingReview.comment && (
                          <p className="mt-4 rounded-lg bg-white p-4 text-sm leading-6 text-slate-700">
                            {existingReview.comment}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              How was your service?
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              Rate{" "}
                              {provider?.name ||
                                "your provider"}{" "}
                              based on your experience.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openReviewForm(
                                booking
                              )
                            }
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            ⭐ Rate Provider
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CANCELLED */}

                {booking.cancellationReason && (
                  <div className="border-t border-slate-200 px-6 py-6">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                        Cancellation Reason
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-900">
                        {
                          booking.cancellationReason
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEW MODAL */}

      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Rate Your Provider
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {reviewingBooking.provider
                    ?.name || "Service Provider"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewForm}
                disabled={submittingReview}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmitReview}
              className="p-6"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  How would you rate the service?
                </p>

                <div className="mt-4 flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          handleRating(star)
                        }
                        className="text-4xl transition hover:scale-110"
                        aria-label={`Rate ${star} star${
                          star > 1 ? "s" : ""
                        }`}
                      >
                        <span
                          className={
                            star <= rating
                              ? "text-yellow-400"
                              : "text-slate-300"
                          }
                        >
                          ★
                        </span>
                      </button>
                    )
                  )}
                </div>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  {rating === 0
                    ? "Select a rating"
                    : `${rating} out of 5 stars`}
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Review
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell us about your experience..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {comment.length}/1000
                </p>
              </div>

              {reviewMessage && (
                <div
                  className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                    reviewMessage
                      .toLowerCase()
                      .includes("success")
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewForm}
                  disabled={submittingReview}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submittingReview ||
                    rating === 0
                  }
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingReview
                    ? "Submitting..."
                    : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;