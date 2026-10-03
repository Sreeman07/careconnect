import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401);
      throw new Error("Not authenticated. Please login.");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select(
      "-password"
    );

    if (!user) {
      res.status(401);
      throw new Error("User no longer exists.");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Your account has been deactivated.");
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401);
      return next(new Error("Invalid authentication token."));
    }

    if (error.name === "TokenExpiredError") {
      res.status(401);
      return next(new Error("Authentication token has expired."));
    }

    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authenticated."));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(
          `Access denied. Required role: ${roles.join(", ")}`
        )
      );
    }

    next();
  };
};

export { protect, authorize };