import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../../services/notificationService";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH NOTIFICATIONS
  ========================================= */

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getNotifications({
          page: 1,
          limit: 100,
          unreadOnly: false,
        });

      const data = response?.data;

      setNotifications(
        data?.notifications || []
      );

      setUnreadCount(
        data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* =========================================
     MARK ONE AS READ
  ========================================= */

  const handleMarkAsRead = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date(),
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(current - 1, 0)
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    }
  };

  /* =========================================
     MARK ALL AS READ
  ========================================= */

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to mark notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================
     DELETE NOTIFICATION
  ========================================= */

  const handleDelete = async (
    notification
  ) => {
    try {
      await deleteNotification(
        notification._id
      );

      setNotifications((current) =>
        current.filter(
          (item) =>
            item._id !== notification._id
        )
      );

      if (!notification.isRead) {
        setUnreadCount((current) =>
          Math.max(current - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to delete notification."
      );
    }
  };

  /* =========================================
     DELETE ALL READ
  ========================================= */

  const handleDeleteAllRead =
    async () => {
      try {
        setActionLoading(true);

        await deleteAllReadNotifications();

        setNotifications((current) =>
          current.filter(
            (notification) =>
              !notification.isRead
          )
        );
      } catch (error) {
        console.error(
          "Delete all read notifications error:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Failed to delete read notifications."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  /* =========================================
     NOTIFICATION ICON
  ========================================= */

  const getNotificationIcon = (
    type
  ) => {
    switch (type) {
      case "service_request":
        return "📋";

      case "quote":
        return "💰";

      case "booking":
        return "📅";

      case "invoice":
        return "🧾";

      case "payment":
        return "💳";

      case "review":
        return "⭐";

      case "provider":
        return "👨‍🔧";

      case "support":
        return "🎧";

      case "system":
        return "⚙️";

      default:
        return "🔔";
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">
              🔔
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Stay updated with your
              CareConnect activities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={
                handleMarkAllAsRead
              }
              disabled={
                actionLoading ||
                unreadCount === 0
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mark All Read
            </button>

            <button
              type="button"
              onClick={
                handleDeleteAllRead
              }
              disabled={
                actionLoading ||
                notifications.every(
                  (item) =>
                    !item.isRead
                )
              }
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Read
            </button>
          </div>
        </div>

        {/* =====================================
            SUMMARY
        ===================================== */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Notifications
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm text-blue-600">
              Unread Notifications
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>
          </div>
        </div>

        {/* =====================================
            ERROR
        ===================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================
            EMPTY STATE
        ===================================== */}

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">
              🔔
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              You are all caught up. New
              updates will appear here.
            </p>
          </div>
        ) : (
          /* =====================================
             NOTIFICATION LIST
          ===================================== */

          <div className="space-y-3">
            {notifications.map(
              (notification) => (
                <div
                  key={notification._id}
                  className={[
                    "rounded-2xl border bg-white p-4 shadow-sm transition",
                    notification.isRead
                      ? "border-slate-200"
                      : "border-blue-200 bg-blue-50/40",
                  ].join(" ")}
                >
                  <div className="flex gap-4">
                    {/* ICON */}

                    <div
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl",
                        notification.isRead
                          ? "bg-slate-100"
                          : "bg-blue-100",
                      ].join(" ")}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {
                                notification.title
                              }
                            </h3>

                            {!notification.isRead && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                New
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {
                              notification.message
                            }
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {formatDate(
                            notification.createdAt
                          )}
                        </span>
                      </div>

                      {notification.sender && (
                        <p className="mt-2 text-xs text-slate-400">
                          From:{" "}
                          <span className="font-medium">
                            {
                              notification
                                .sender
                                .name
                            }
                          </span>
                        </p>
                      )}

                      {/* ACTIONS */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification
                              )
                            }
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            View & Mark Read
                          </button>
                        )}

                        {notification.isRead &&
                          notification.link && (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  notification.link
                                )
                              }
                              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              Open
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              notification
                            )
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;