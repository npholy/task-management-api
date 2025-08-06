import { prisma } from '@/lib/prisma';
import { handleError } from '@/utils/errorhandler';
import { registerSchema } from '@/utils/validate';
import bcrypt from 'bcrypt';
import { generateToken } from '@/lib/jwt';
import { z } from 'zod';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
  }
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return handleError(req, res, new Error('User exists'), 'User already exists', 409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    const token = generateToken(user);
    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    return handleError(req, res, error, error instanceof z.ZodError ? 'Invalid user data' : 'Failed to register user', error instanceof z.ZodError ? 400 : 500);
  }
}