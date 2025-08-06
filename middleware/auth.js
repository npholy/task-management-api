import jwt from 'jsonwebtoken';
import { handleError } from '@/utils/errorhandler';

export function verifyToken(req, res, next) {
  console.log('All Headers:', JSON.stringify(req.headers, null, 2)); // Debug
    const authHeader = req.headers.authorization || req.headers.Authorization || req.get('authorization');
  console.log('Auth Header:', authHeader); // Debug
    if (!authHeader || !authHeader.match(/^Bearer\s+\S+$/)) {
    return handleError(req, res, new Error('Missing or malformed token'), 'Missing or invalid token', 401);
}
const token = authHeader.split(' ')[1];
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Debug
    req.user = decoded;
    next();
} catch (error) {
    return handleError(req, res, error, 'Invalid or expired token', 401);
}
}