import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { verifyToken } from '../../../middleware/auth.js';
import { handleError } from '../../../utils/errorhandler';
import { taskSchema } from '../../../utils/validate';

async function handler(req, res) {
  const { id } = req.query;
  const taskId = parseInt(id);

  if (req.method === 'PUT') {
    try {
      const { title, description, status, categoryId } = taskSchema.parse(req.body);

      // req.user is already populated by verifyToken middleware
      const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.user.id } });
      if (!task) {
        return handleError(req, res, new Error('Task not found'), 'Task not found', 404);
      }

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

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title || task.title,
          description: description || task.description,
          status: status || task.status,
          categoryId: categoryId || task.categoryId,
        },
      });
      return res.status(200).json(updatedTask);
    } catch (error) {
      return handleError(
        req,
        res,
        error,
        error instanceof z.ZodError ? 'Invalid task data' : 'Failed to update task',
        error instanceof z.ZodError ? 400 : 500
      );
    }
  } else if (req.method === 'DELETE') {
    try {
      const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.user.id } });
      if (!task) {
        return handleError(req, res, new Error('Task not found'), 'Task not found', 404);
      }
      await prisma.task.delete({ where: { id: taskId } });
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      return handleError(req, res, error, 'Failed to delete task', 500);
    }
  } else {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use PUT or DELETE', 405);
  }
}

export default verifyToken(handler);