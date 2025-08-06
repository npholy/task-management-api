import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { handleError } from '@/utils/errorhandler';
import { categorySchema } from '@/utils/validate';
import { z } from 'zod'; // Add this import

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
  }
  return verifyToken(req, res, async () => {
    try {
      const { name } = categorySchema.parse(req.body);
      const existingCategory = await prisma.category.findUnique({ where: { name } });
      if (existingCategory) {
        return handleError(req, res, new Error('Category exists'), 'Category already exists', 409);
      }
      const category = await prisma.category.create({
        data: { name, userId: req.user.userId },
      });
      return res.status(201).json(category);
    } catch (error) {
      return handleError(req, res, error, error instanceof z.ZodError ? 'Invalid category data' : 'Failed to create category', error instanceof z.ZodError ? 400 : 500);
    }
  });
}