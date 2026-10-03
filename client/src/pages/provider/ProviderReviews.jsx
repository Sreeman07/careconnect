import { useEffect, useState } from "react";

import {
  getProviderReviews,
} from "../../services/reviewService";

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getProviderReviews();

      setReviews(response.reviews || []);
    } catch (err) {
      console.error(
        "Fetch provider reviews error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const getAverageRating = () => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return (
      total / reviews.length
    ).toFixed(1);
  };

  const getRatingCount = (rating) => {
    return reviews.filter(
      (review) =>
        Number(review.rating) === rating
    ).length;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
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

  const renderStars = (
    rating,
    size = "text-xl"
  ) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <span
              key={star}
              className={`${size} ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-slate-300"
              }`}
            >
              ★
            </span>
          )
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading your reviews...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageRating =
    getAverageRating();

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Reviews
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              See what customers are saying about
              your services.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReviews}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchReviews}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* AVERAGE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Average Rating
            </p>

            <div className="mt-3 flex items-center gap-4">
              <p className="text-4xl font-bold text-slate-900">
                {averageRating}
              </p>

              <div>
                {renderStars(
                  Math.round(
                    Number(
                      averageRating
                    )
                  ),
                  "text-lg"
                )}

                <p className="mt-1 text-xs text-slate-500">
                  Based on {reviews.length}{" "}
                  review
                  {reviews.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Reviews
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {reviews.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Customer feedback received
            </p>
          </div>

          {/* 5 STAR */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Five-Star Reviews
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {getRatingCount(5)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Excellent service ratings
            </p>
          </div>
        </div>

        {/* RATING BREAKDOWN */}

        {reviews.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Rating Breakdown
            </h2>

            <div className="mt-5 space-y-3">
              {[5, 4, 3, 2, 1].map(
                (rating) => {
                  const count =
                    getRatingCount(
                      rating
                    );

                  const percentage =
                    reviews.length > 0
                      ? (
                          (count /
                            reviews.length) *
                          100
                        ).toFixed(0)
                      : 0;

                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-3"
                    >
                      <div className="flex w-20 items-center gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          {rating}
                        </span>

                        <span className="text-yellow-400">
                          ★
                        </span>
                      </div>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="w-8 text-right text-sm text-slate-500">
                        {count}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* REVIEWS */}

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              ⭐
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No reviews yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Customer reviews will appear here
              after you complete your first job.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {review.customer?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "C"}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.customer
                          ?.name ||
                          "Customer"}
                      </p>

                      <p className="text-xs text-slate-500">
                        Reviewed on{" "}
                        {formatDate(
                          review.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    {renderStars(
                      review.rating
                    )}

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {review.rating}/5
                    </p>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-700">
                      "{review.comment}"
                    </p>
                  </div>
                )}

                {review.booking && (
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    {review.booking
                      .serviceCategory
                      ?.name && (
                      <span>
                        🛠️{" "}
                        {
                          review.booking
                            .serviceCategory
                            .name
                        }
                      </span>
                    )}

                    {review.booking
                      .amount && (
                      <span>
                        💰 ₹
                        {Number(
                          review.booking
                            .amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderReviews;