import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from "../services/notificationService.js";

const getNotifications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
    } = req.query;

    const result = await getUserNotifications(
      req.user._id,
      {
        page,
        limit,
        unreadOnly,
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount =
      await getUnreadNotificationCount(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification =
      await markNotificationAsRead(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const modifiedCount =
      await markAllNotificationsAsRead(
        req.user._id
      );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      data: {
        modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeNotification = async (
  req,
  res,
  next
) => {
  try {
    await deleteNotification(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const removeAllReadNotifications = async (
  req,
  res,
  next
) => {
  try {
    const deletedCount =
      await deleteAllReadNotifications(
        req.user._id
      );

    res.status(200).json({
      success: true,
      message:
        "All read notifications deleted successfully.",
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
  removeAllReadNotifications,
};