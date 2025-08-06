import { handleError } from '@/utils/errorhandler';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
}
try {
    return res.status(200).json({ message: 'Logged out successfully' });
} catch (error) {
    return handleError(req, res, error, 'Failed to logout', 500);
}
}