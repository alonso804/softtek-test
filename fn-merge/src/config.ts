import { z } from 'zod';

const appEnvSchema = z.enum(['local']);

if (process.env.APP_ENV === appEnvSchema.enum.local) {
  process.loadEnvFile('.env');
}

const sharedSchema = z.object({
  CACHE_DYNAMODB_TABLE_NAME: z.string().min(1, 'CACHE_DYNAMODB_TABLE_NAME is required'),
  LIBSQL_DB_URI: z.string().min(1, 'LIBSQL_DB_URI is required'),
  LIBSQL_DB_TOKEN: z.string().min(1, 'LIBSQL_DB_TOKEN is required'),
});

const localSchema = z
  .object({
    APP_ENV: z.literal(appEnvSchema.enum.local),
    AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
    AWS_ACCESS_KEY: z.string().min(1, 'AWS_ACCESS_KEY is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  })
  .merge(sharedSchema);

const prodSchema = z
  .object({
    APP_ENV: z.literal(undefined),
  })
  .merge(sharedSchema);

const envVariablesSchema = z.discriminatedUnion('APP_ENV', [localSchema, prodSchema]);

const parsedEnvVariables = envVariablesSchema.safeParse(process.env);

if (!parsedEnvVariables.success) {
  console.error(parsedEnvVariables.error.errors);

  throw new Error('Invalid environment variables');
}

export const CONFIG = parsedEnvVariables.data;
