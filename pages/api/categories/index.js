import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { verifyToken } from '../../../middleware/auth.js';
import { handleError } from '../../../utils/errorhandler';
import { categorySchema } from '../../../utils/validate';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { name } = categorySchema.parse(req.body);

      const category = await prisma.category.create({
        data: {
          name,
          user: {
            connect: { id: req.user.id },
          },
        },
      });

      return res.status(201).json(category);
    } catch (error) {
      return handleError(
        req,
        res,
        error,
        error instanceof z.ZodError ? 'Invalid category data' : 'Failed to create category',
        error instanceof z.ZodError ? 400 : 500
      );
    }
  } else {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
  }
}

export default verifyToken(handler);