import { env } from "~/env";
import * as schema from "./schema";

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const nqf = neon(env.DATABASE_URL);
export const db = drizzle(
  nqf,
  { schema }
);

export type TXType = null
export type DBType = typeof db // PlanetScaleDatabase<typeof schema>
export type DBTX = DBType | TXType
export { schema }