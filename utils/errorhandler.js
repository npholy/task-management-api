export function handleError(req, res, error, message = 'Internal Server Error', statusCode = 500) {
  console.error(`[${req.method} ${req.url}] ${message}:`, error);
  return res.status(statusCode).json({ message, error: error.message });
}