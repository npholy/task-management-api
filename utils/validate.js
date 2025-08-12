import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email().max(100),
    password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
    email: z.string().email().max(100),
    password: z.string().min(6).max(100),
});

export const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    categoryId: z.number().int().positive('Invalid category ID').optional(),
});

export const categorySchema = z.object({
    name: z.string().min(3).max(50),
});