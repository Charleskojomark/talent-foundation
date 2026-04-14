import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const tursoDbUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

// Throw early if environment variables are missing
if (!tursoDbUrl || !tursoAuthToken) {
    throw new Error("Missing Turso environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined.");
}

const client = createClient({
    url: tursoDbUrl,
    authToken: tursoAuthToken,
});

export const db = drizzle(client, { schema });
