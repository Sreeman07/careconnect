import api from "./api";

/* =========================================
   GET NOTIFICATIONS
========================================= */

const getNotifications = async ({
  page = 1,
  limit = 20,
  unreadOnly = false,
} = {}) => {
  const response = await api.get("/notifications", {
    params: {
      page,
      limit,
      unreadOnly,
    },
  });

  return response.data;
};

/* =========================================
   GET UNREAD COUNT
========================================= */

const getUnreadNotificationCount = async () => {
  const response = await api.get(
    "/notifications/unread-count"
  );

  return response.data;
};

/* =========================================
   MARK ONE AS READ
========================================= */

const markNotificationAsRead = async (
  notificationId
) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

/* =========================================
   MARK ALL AS READ
========================================= */

const markAllNotificationsAsRead = async () => {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
};

/* =========================================
   DELETE ONE
========================================= */

const deleteNotification = async (
  notificationId
) => {
  const response = await api.delete(
    `/notifications/${notificationId}`
  );

  return response.data;
};

/* =========================================
   DELETE ALL READ
========================================= */

const deleteAllReadNotifications = async () => {
  const response = await api.delete(
    "/notifications/read"
  );

  return response.data;
};

export {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
};