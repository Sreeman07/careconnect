const validate = (validations) => {
  return async (req, res, next) => {
    const validationErrors = [];

    for (const validation of validations) {
      const result = await validation.run(req);

      if (!result.isEmpty()) {
        validationErrors.push(
          ...result.array()
        );
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationErrors.map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }

    next();
  };
};

export default validate;