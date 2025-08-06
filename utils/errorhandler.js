export function handleError(req, res, error, message = 'Internal Server Error', statusCode = 500) {
console.error(`[${req.method} ${req.url}] ${message}`, error);
if (typeof res.status !== 'function') {
    console.error('Invalid res object:', res);
    return res.json({ message: 'Invalid response object' });
}
return res.status(statusCode).json({ message });
}