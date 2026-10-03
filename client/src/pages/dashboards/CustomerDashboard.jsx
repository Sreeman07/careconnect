import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";
import api from "../../services/api";

const CustomerDashboard = () => {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    activeBookings: 0,
    pendingQuotes: 0,
    completedJobs: 0,
  });

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [bookingsResponse, quotesResponse] =
        await Promise.all([
          api.get("/bookings/customer"),
          api.get("/quotes/customer"),
        ]);

      const bookingsData =
        bookingsResponse?.data || {};

      const quotesData =
        quotesResponse?.data || {};

      /*
       * Handle the possible response formats:
       *
       * { bookings: [...] }
       * OR
       * { data: [...] }
       * OR
       * [...]
       */

      const bookings = Array.isArray(bookingsData)
        ? bookingsData
        : Array.isArray(bookingsData.bookings)
        ? bookingsData.bookings
        : Array.isArray(bookingsData.data)
        ? bookingsData.data
        : [];

      const quotes = Array.isArray(quotesData)
        ? quotesData
        : Array.isArray(quotesData.quotes)
        ? quotesData.quotes
        : Array.isArray(quotesData.data)
        ? quotesData.data
        : [];

      const activeBookings = bookings.filter(
        (booking) =>
          booking.status === "scheduled" ||
          booking.status === "in_progress"
      ).length;

      const completedJobs = bookings.filter(
        (booking) =>
          booking.status === "completed"
      ).length;

      const pendingQuotes = quotes.filter(
        (quote) =>
          quote.status === "pending"
      ).length;

      setStats({
        activeBookings,
        pendingQuotes,
        completedJobs,
      });
    } catch (error) {
      console.error(
        "Customer dashboard error:",
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

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Customer Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Welcome back, {user?.name}.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">

        {/* Active Bookings */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "..." : stats.activeBookings}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Scheduled or in-progress services
          </p>
        </div>

        {/* Pending Quotes */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending Quotes
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "..." : stats.pendingQuotes}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Quotes waiting for your response
          </p>
        </div>

        {/* Completed Jobs */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed Jobs
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "..." : stats.completedJobs}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Successfully completed services
          </p>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;