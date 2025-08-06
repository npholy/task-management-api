import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/middleware/auth';
import { handleError } from '@/utils/errorhandler';
import { taskSchema } from '@/utils/validate';
import { z } from 'zod'; // Add this import

export default async function handler(req, res) {
  const { id } = req.query;
  const taskId = parseInt(id);

  if (req.method === 'PUT') {
    return verifyToken(req, res, async () => {
      try {
        const { title, description, status, categoryId } = taskSchema.parse(req.body);
        const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.user.userId } });
        if (!task) {
          return handleError(req, res, new Error('Task not found'), 'Task not found', 404);
        }
        const updatedTask = await prisma.task.update({
          where: { id: taskId },
          data: { title, description, status, categoryId },
        });
        return res.status(200).json(updatedTask);
      } catch (error) {
        return handleError(req, res, error, error instanceof z.ZodError ? 'Invalid task data' : 'Failed to update task', error instanceof z.ZodError ? 400 : 500);
      }
    });
  } else if (req.method === 'DELETE') {
    return verifyToken(req, res, async () => {
      try {
        const task = await prisma.task.findFirst({ where: { id: taskId, userId: req.user.userId } });
        if (!task) {
          return handleError(req, res, new Error('Task not found'), 'Task not found', 404);
        }
        await prisma.task.delete({ where: { id: taskId } });
        return res.status(200).json({ message: 'Task deleted successfully' });
      } catch (error) {
        return handleError(req, res, error, 'Failed to delete task', 500);
      }
    });
  } else {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use PUT or DELETE', 405);
  }
}