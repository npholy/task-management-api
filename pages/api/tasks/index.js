import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { verifyToken } from '../../../middleware/auth.js';
import { handleError } from '../../../utils/errorhandler';
import { taskSchema } from '../../../utils/validate';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { title, description, status, categoryId } = taskSchema.parse(req.body);

      // Validate categoryId if provided
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          return res.status(400).json({ message: `Category with ID ${categoryId} does not exist` });
        }
        if (category.userId !== req.user.id) {
          return res.status(403).json({ message: 'Unauthorized to use this category' });
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          status: status || 'TODO',
          category: categoryId ? { connect: { id: categoryId } } : undefined,
          user: {
            connect: { id: req.user.id },
          },
        },
      });

      return res.status(201).json(task);
    } catch (error) {
      return handleError(
        req,
        res,
        error,
        error instanceof z.ZodError ? 'Invalid task data' : 'Failed to create task',
        error instanceof z.ZodError ? 400 : 500
      );
    }
  } else if (req.method === 'GET') {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { category, status } = req.query;
      const where = { userId: req.user.id };

      if (category) {
        where.category = { name: category };
      }
      if (status) {
        where.status = status;
      }

      const tasks = await prisma.task.findMany({
        where,
        include: { category: true },
      });

      return res.status(200).json(tasks);
    } catch (error) {
      return handleError(req, res, error, 'Failed to fetch tasks', 500);
    }
  } else {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST or GET', 405);
  }
}

export default verifyToken(handler);