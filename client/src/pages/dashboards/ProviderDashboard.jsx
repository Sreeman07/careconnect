import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";
import api from "../../services/api";

const ProviderDashboard = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    todaysJobs: 0,
    pendingQuotes: 0,
    upcomingJobs: 0,
    completedJobs: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        requestsResponse,
        bookingsResponse,
      ] = await Promise.all([
        api.get("/quotes/provider/requests"),
        api.get("/bookings/provider"),
      ]);

      const requestsData =
        requestsResponse?.data || {};

      const bookingsData =
        bookingsResponse?.data || {};

      /*
       * Provider requests
       *
       * Backend currently returns:
       *
       * {
       *   requests: [...]
       * }
       */

      const requests = Array.isArray(
        requestsData.requests
      )
        ? requestsData.requests
        : Array.isArray(requestsData.data)
        ? requestsData.data
        : Array.isArray(requestsData)
        ? requestsData
        : [];

      /*
       * Provider bookings
       */

      const bookings = Array.isArray(bookingsData)
        ? bookingsData
        : Array.isArray(bookingsData.bookings)
        ? bookingsData.bookings
        : Array.isArray(bookingsData.data)
        ? bookingsData.data
        : [];

      /*
       * Pending quotes
       *
       * Each provider request contains:
       *
       * request.quote
       */

      const pendingQuotes = requests.filter(
        (request) =>
          request.quote &&
          request.quote.status === "pending"
      ).length;

      /*
       * Today's date
       */

      const today = new Date();

      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();

      /*
       * Today's jobs
       */

      const todaysJobs = bookings.filter(
        (booking) => {
          if (!booking.scheduledDate) {
            return false;
          }

          const scheduledDate = new Date(
            booking.scheduledDate
          );

          return (
            scheduledDate.getFullYear() ===
              todayYear &&
            scheduledDate.getMonth() ===
              todayMonth &&
            scheduledDate.getDate() ===
              todayDate &&
            (
              booking.status === "scheduled" ||
              booking.status === "in_progress"
            )
          );
        }
      ).length;

      /*
       * Upcoming jobs
       *
       * Includes scheduled and in-progress
       * bookings from today onwards.
       */

      const todayStart = new Date(
        todayYear,
        todayMonth,
        todayDate
      );

      const upcomingJobs = bookings.filter(
        (booking) => {
          if (!booking.scheduledDate) {
            return false;
          }

          const scheduledDate = new Date(
            booking.scheduledDate
          );

          return (
            scheduledDate >= todayStart &&
            (
              booking.status === "scheduled" ||
              booking.status === "in_progress"
            )
          );
        }
      ).length;

      /*
       * Completed jobs
       */

      const completedJobs = bookings.filter(
        (booking) =>
          booking.status === "completed"
      ).length;

      setStats({
        todaysJobs,
        pendingQuotes,
        upcomingJobs,
        completedJobs,
      });
    } catch (error) {
      console.error(
        "Provider dashboard error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    [
      "Today's Jobs",
      stats.todaysJobs,
    ],
    [
      "Pending Quotes",
      stats.pendingQuotes,
    ],
    [
      "Upcoming Jobs",
      stats.upcomingJobs,
    ],
    [
      "Completed Jobs",
      stats.completedJobs,
    ],
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Provider Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Welcome back, {user?.name}.
          </p>
        </div>

        <Link
          to="/provider/profile"
          className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
        >
          Manage Profile
        </Link>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {statCards.map(
          ([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : value}
              </p>
            </div>
          )
        )}
      </div>

      {/* Provider Journey + Quick Actions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Provider Journey */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Provider Journey
          </h2>

          <div className="mt-6 space-y-4">
            {[
              "Complete your provider profile",
              "Add your skills",
              "Add service areas",
              "Submit verification",
              "Start receiving service requests",
            ].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    {index + 1}
                  </div>

                  <p className="text-sm text-slate-700">
                    {step}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Quick Actions
          </h2>

          <div className="mt-6 grid gap-3">

            <Link
              to="/provider/profile"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="font-semibold">
                Complete Profile
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Update your professional information.
              </p>
            </Link>

            <Link
              to="/provider/quotes"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="font-semibold">
                My Quotes
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Review assigned requests and submit
                quotations.
              </p>
            </Link>

            <Link
              to="/provider/bookings"
              className="rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="font-semibold">
                My Jobs
              </p>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your scheduled services.
              </p>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;