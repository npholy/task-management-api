import { z } from 'zod';
import prisma from '../../../lib/prisma.js';
import { handleError } from '../../../utils/errorhandler';
import { loginSchema } from '../../../utils/validate';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return handleError(req, res, new Error('Method not allowed'), 'Method not allowed, use POST', 405);
  }

  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email }, // Use `id` instead of `userId`
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Generated Token:', token); // Debug log
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return handleError(
      req,
      res,
      error,
      error instanceof z.ZodError ? 'Invalid login data' : 'Failed to login',
      error instanceof z.ZodError ? 400 : 500
    );
  }
}

export default handler;