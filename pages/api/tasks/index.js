import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { handleError } from '@/utils/errorhandler';
import { taskSchema } from '@/utils/validate';
import { z } from 'zod'; // Add this import

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return verifyToken(req, res, async () => {
      try {
        const { title, description, status, categoryId } = taskSchema.parse(req.body);
        const task = await prisma.task.create({
          data: {
            title,
            description,
            status,
            userId: req.user.userId,
            categoryId,
          },
        });
        return res.status(201).json(task);
      } catch (error) {
        return handleError(req, res, error, error instanceof z.ZodError ? 'Invalid task data' : 'Failed to create task', error instanceof z.ZodError ? 400 : 500);
      }
    });
  } else if (req.method === 'GET') {
    return verifyToken(req, res, async () => {
      try {
        const { search, status, categoryId } = req.query;
        const where = { userId: req.user.userId };
        if (search) {
          where.title = { contains: search, mode: 'insensitive' };
        }
        if (status) {
          where.status = status;
        }
        if (categoryId) {
          where.categoryId = parseInt(categoryId);
        }
        const tasks = await prisma.task.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(tasks);
      } catch (error) {
        return handleError(req, res, error, 'Failed to fetch tasks', 500);
      }
    });
  } else {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST or GET', 405);
  }
}