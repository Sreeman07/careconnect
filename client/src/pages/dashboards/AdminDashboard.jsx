import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getAdminDashboardStats,
} from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      customers: 0,
      providers: 0,
    },

    providers: {
      total: 0,
      verified: 0,
      pendingVerification: 0,
    },

    serviceCategories: 0,
    serviceRequests: 0,

    bookings: {
      active: 0,
      completed: 0,
    },

    quotes: {
      pending: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load Admin Dashboard
  |--------------------------------------------------------------------------
  */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response =
        await getAdminDashboardStats();

      console.log(
        "Admin dashboard response:",
        response
      );

      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const statisticCards = [
    {
      label: "Total Users",
      value: stats.users.total,
      description: `${stats.users.customers} customers • ${stats.users.providers} providers`,
      icon: "👥",
    },

    {
      label: "Providers",
      value: stats.providers.total,
      description: `${stats.providers.verified} verified providers`,
      icon: "👨‍🔧",
    },

    {
      label: "Pending Verification",
      value:
        stats.providers.pendingVerification,
      description:
        "Provider applications awaiting review",
      icon: "⏳",
    },

    {
      label: "Service Categories",
      value:
        stats.serviceCategories,
      description:
        "Available home service categories",
      icon: "🛠️",
    },

    {
      label: "Service Requests",
      value:
        stats.serviceRequests,
      description:
        "Total customer service requests",
      icon: "📋",
    },

    {
      label: "Active Bookings",
      value:
        stats.bookings.active,
      description:
        "Scheduled or in-progress bookings",
      icon: "📅",
    },

    {
      label: "Completed Jobs",
      value:
        stats.bookings.completed,
      description:
        "Successfully completed services",
      icon: "✅",
    },

    {
      label: "Pending Quotes",
      value:
        stats.quotes.pending,
      description:
        "Quotes waiting for customer response",
      icon: "💰",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage and monitor the CareConnect
            platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/providers"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500"
          >
            Manage Providers
          </Link>

          <Link
            to="/admin/service-categories"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-700"
          >
            Manage Services
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statisticCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "..." : card.value}
                </p>
              </div>

              <div className="text-2xl">
                {card.icon}
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Platform Management */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">
          Platform Management
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Provider Management */}
          <Link
            to="/admin/providers"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-3xl">
              👨‍🔧
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Provider Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review provider profiles, verify
              providers, reject applications, and
              manage account status.
            </p>
          </Link>

          {/* Service Categories */}
          <Link
            to="/admin/service-categories"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-3xl">
              🛠️
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Service Categories
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create and manage plumbing,
              electrical, cleaning, appliance repair,
              and other home services.
            </p>
          </Link>

          {/* Service Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              📋
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Service Requests
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The platform currently has{" "}
              <span className="font-semibold text-slate-700">
                {loading
                  ? "..."
                  : stats.serviceRequests}
              </span>{" "}
              service requests.
            </p>
          </div>

          {/* Booking Operations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              📅
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Booking Operations
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              There are{" "}
              <span className="font-semibold text-slate-700">
                {loading
                  ? "..."
                  : stats.bookings.active}
              </span>{" "}
              active bookings and{" "}
              <span className="font-semibold text-slate-700">
                {loading
                  ? "..."
                  : stats.bookings.completed}
              </span>{" "}
              completed jobs.
            </p>
          </div>

          {/* Quote Monitoring */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-3xl">
              💰
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Quote Monitoring
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              There are{" "}
              <span className="font-semibold text-slate-700">
                {loading
                  ? "..."
                  : stats.quotes.pending}
              </span>{" "}
              pending quotes awaiting customer
              responses.
            </p>
          </div>

          {/* Provider Verification */}
          <Link
            to="/admin/providers"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
          >
            <div className="text-3xl">
              ⚖️
            </div>

            <h3 className="mt-4 text-lg font-bold">
              Provider Verification
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              There are{" "}
              <span className="font-semibold text-slate-700">
                {loading
                  ? "..."
                  : stats.providers
                      .pendingVerification}
              </span>{" "}
              provider applications waiting for
              verification.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;