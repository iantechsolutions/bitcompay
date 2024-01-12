import { Client } from "@planetscale/database";
import { PlanetScalePreparedQueryHKT, PlanetscaleQueryResultHKT, drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "~/env";
import * as schema from "./schema";
import { MySqlTransaction } from "drizzle-orm/mysql-core";
import { ExtractTablesWithRelations } from "drizzle-orm";

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema }
);

export type TXType = MySqlTransaction<PlanetscaleQueryResultHKT, PlanetScalePreparedQueryHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>
export type DBType = typeof db // PlanetScaleDatabase<typeof schema>
export type DBTX = DBType | TXType
export { schema }