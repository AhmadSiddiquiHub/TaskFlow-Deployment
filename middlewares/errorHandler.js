const errorHandler = (err, req, res, next) => {
  // Set a default status code (500 - Internal Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Send a meaningful response to the client
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? "🔒" : err.stack,
  });
  next();
};

module.exports = { errorHandler };
