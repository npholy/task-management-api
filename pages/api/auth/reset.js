import prisma from '../../../lib/prisma.js';
import { handleError } from '../../../utils/errorhandler';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
    }
    try {
        const { confirm } = req.body;
        if (!confirm) {
            return handleError(req, res, new Error('Confirmation required'), 'Confirmation required', 400);
        }
        await prisma.task.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
        return res.status(200).json({ message: 'Users and data cleared successfully' });
    } catch (error) {
        return handleError(req, res, error, 'Failed to reset database', 500);
    }
}