const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);

  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode === 200 ? 500 : res.statusCode;

  let message = err.message || "Something went wrong.";

  let validationErrors;

  try {
    const parsed = JSON.parse(message);

    if (parsed.message === "Validation failed") {
      message = parsed.message;
      validationErrors = parsed.errors;
      statusCode = 400;
    }
  } catch {
    // Normal error message
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(validationErrors && {
      errors: validationErrors,
    }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export {
  notFound,
  errorHandler,
};