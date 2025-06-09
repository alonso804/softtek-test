import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().min(1).or(z.string().regex(/^\d+$/).transform(Number)).default(1),
  limit: z.number().int().min(1).or(z.string().regex(/^\d+$/).transform(Number)).default(10),
});
