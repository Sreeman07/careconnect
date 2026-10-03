import Notification from "../models/Notification.js";

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  relatedId = null,
}) => {
  if (!recipient) {
    throw new Error("Notification recipient is required.");
  }

  if (!type) {
    throw new Error("Notification type is required.");
  }

  if (!title) {
    throw new Error("Notification title is required.");
  }

  if (!message) {
    throw new Error("Notification message is required.");
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    link,
    relatedId,
  });

  return notification;
};

const createBulkNotifications = async (notifications) => {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return [];
  }

  return Notification.insertMany(notifications);
};

const getUserNotifications = async (
  userId,
  {
    page = 1,
    limit = 20,
    unreadOnly = false,
  } = {}
) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  const filter = {
    recipient: userId,
  };

  if (unreadOnly === true || unreadOnly === "true") {
    filter.isRead = false;
  }

  const [notifications, total, unreadCount] =
    await Promise.all([
      Notification.find(filter)
        .populate("sender", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({
        recipient: userId,
        isRead: false,
      }),
    ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

const getUnreadNotificationCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();
  }

  return notification;
};

const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

const deleteNotification = async (
  notificationId,
  userId
) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new Error("Notification not found.");
  }

  return notification;
};

const deleteAllReadNotifications = async (userId) => {
  const result = await Notification.deleteMany({
    recipient: userId,
    isRead: true,
  });

  return result.deletedCount;
};

export {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
};