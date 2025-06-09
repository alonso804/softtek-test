import { z } from 'zod';

process.loadEnvFile('.env');

const envVariablesSchema = z.object({
  LIBSQL_DB_URI: z.string().min(1, 'LIBSQL_DB_URI is required'),
  LIBSQL_DB_TOKEN: z.string().min(1, 'LIBSQL_DB_TOKEN is required'),
});

const parsedEnvVariables = envVariablesSchema.safeParse(process.env);

if (!parsedEnvVariables.success) {
  console.error(parsedEnvVariables.error.errors);

  throw new Error('Invalid environment variables');
}

export const CONFIG = parsedEnvVariables.data;
