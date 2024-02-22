import { env } from "~/env";
import * as schema from "./schema";

import { neon } from '@neondatabase/serverless';

// import { drizzle } from 'drizzle-orm/neon-http';

// const nqf = neon(env.DATABASE_URL);
// export const db = drizzle(
//   nqf,
//   { schema }
// );

import postgres from 'postgres';
const queryClient = postgres(env.DATABASE_URL);
import { PostgresJsQueryResultHKT, drizzle } from 'drizzle-orm/postgres-js';
import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

export const db = drizzle(
  queryClient,
  { schema }
);

export type TXType = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>
export type DBType = typeof db // PlanetScaleDatabase<typeof schema>
export type DBTX = DBType | TXType
export { schema }