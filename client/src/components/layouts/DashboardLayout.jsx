import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import useAuthStore from "../../store/authStore";

import {
  getUnreadNotificationCount,
} from "../../services/notificationService";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const { user, logout } =
    useAuthStore();

  const [unreadCount, setUnreadCount] =
    useState(0);

  /* =========================================
     FETCH UNREAD NOTIFICATION COUNT
  ========================================= */

  const fetchUnreadCount = async () => {
    try {
      if (!user) {
        return;
      }

      const response =
        await getUnreadNotificationCount();

      setUnreadCount(
        response?.data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Fetch unread notification count error:",
        error
      );
    }
  };

  /* =========================================
     INITIAL COUNT + POLLING
  ========================================= */

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================
     ROLE NAME
  ========================================= */

  const getRoleName = () => {
    switch (user?.role) {
      case "admin":
        return "Admin";

      case "provider":
        return "Service Provider";

      case "customer":
        return "Customer";

      case "operations":
        return "Operations Manager";

      case "support":
        return "Support Agent";

      default:
        return "User";
    }
  };

  /* =========================================
     NAVIGATION ITEMS
  ========================================= */

  const getNavigationItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            label: "Dashboard",
            path: "/dashboard/admin",
            icon: "📊",
          },
          {
            label: "Providers",
            path: "/admin/providers",
            icon: "👨‍🔧",
          },
          {
            label: "Service Categories",
            path: "/admin/service-categories",
            icon: "🛠️",
          },
        ];

      case "provider":
        return [
          {
            label: "Dashboard",
            path: "/dashboard/provider",
            icon: "📊",
          },
          {
            label: "My Profile",
            path: "/provider/profile",
            icon: "👤",
          },
          {
            label: "My Quotes",
            path: "/provider/quotes",
            icon: "💰",
          },
          {
            label: "My Jobs",
            path: "/provider/jobs",
            icon: "🔧",
          },
          {
            label: "My Reviews",
            path: "/provider/reviews",
            icon: "⭐",
          },
          {
            label: "My Invoices",
            path: "/provider/invoices",
            icon: "🧾",
          },
          {
            label: "Payment History",
            path: "/provider/payments",
            icon: "💳",
          },
        ];

      case "customer":
        return [
          {
            label: "Dashboard",
            path: "/dashboard/customer",
            icon: "📊",
          },
          {
            label: "My Requests",
            path: "/dashboard/customer/requests",
            icon: "📋",
          },
          {
            label: "New Request",
            path: "/dashboard/customer/requests/new",
            icon: "➕",
          },
          {
            label: "My Quotes",
            path: "/customer/quotes",
            icon: "💰",
          },
          {
            label: "My Bookings",
            path: "/customer/bookings",
            icon: "📅",
          },
          {
            label: "My Invoices",
            path: "/customer/invoices",
            icon: "🧾",
          },
          {
            label: "Payment History",
            path: "/customer/payments",
            icon: "💳",
          },
        ];

      case "operations":
        return [
          {
            label: "Dashboard",
            path: "/dashboard/operations",
            icon: "📊",
          },
        ];

      case "support":
        return [
          {
            label: "Dashboard",
            path: "/dashboard/support",
            icon: "📊",
          },
        ];

      default:
        return [];
    }
  };

  const navigationItems =
    getNavigationItems();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* LOGO */}

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-xl font-bold tracking-tight text-blue-600 sm:text-2xl"
          >
            CareConnect
          </button>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3 sm:gap-4">
            {/* =================================
                NOTIFICATION BUTTON
            ================================= */}

            <button
              type="button"
              onClick={() =>
                navigate("/notifications")
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl transition hover:bg-slate-50"
              title="Notifications"
            >
              🔔

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* USER INFO */}

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-slate-500">
                {getRoleName()}
              </p>
            </div>

            {/* AVATAR */}

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* =====================================
          MAIN LAYOUT
      ===================================== */}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ===================================
            SIDEBAR
        =================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
          <div className="p-5">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {getRoleName()} Portal
              </p>
            </div>

            {/* NOTIFICATIONS NAVIGATION */}

            <button
              type="button"
              onClick={() =>
                navigate("/notifications")
              }
              className="mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">
                  🔔
                </span>

                <span>
                  Notifications
                </span>
              </span>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* ROLE NAVIGATION */}

            <nav className="space-y-2">
              {navigationItems.map(
                (item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={
                      item.path ===
                      `/dashboard/${user?.role}`
                    }
                    className={({
                      isActive,
                    }) =>
                      [
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ].join(" ")
                    }
                  >
                    <span className="text-lg">
                      {item.icon}
                    </span>

                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                )
              )}
            </nav>
          </div>

          {/* SIDEBAR FOOTER */}

          <div className="mx-5 mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">
              CareConnect
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Home services booking and
              operations platform.
            </p>
          </div>
        </aside>

        {/* ===================================
            CONTENT
        =================================== */}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;