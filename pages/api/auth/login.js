import { prisma } from '@/lib/prisma';
import { handleError } from '@/utils/errorhandler';
import { loginSchema } from '@/utils/validate';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';
import { z } from 'zod'; // Add this import

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
  }
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return handleError(req, res, new Error('Invalid credentials'), 'Invalid email or password', 401);
    }
    const token = generateToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    return handleError(req, res, error, error instanceof z.ZodError ? 'Invalid login data' : 'Failed to login', error instanceof z.ZodError ? 400 : 500);
  }
}