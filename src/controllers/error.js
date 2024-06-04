class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const ErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500; // Internal Server Error code.
  let message = err.message || 'Internal Server Error';
  let details = err.details;

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    status: 'Error',
    error_message: message,
    ...(details && { details: details }),
  });
};

export { ApiError, ErrorHandler };
