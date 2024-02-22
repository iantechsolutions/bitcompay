import {
  pgTableCreator, timestamp, varchar,
} from "drizzle-orm/pg-core";
import { createId } from "~/lib/utils";

export const pgTable = pgTableCreator((name) => `bitcompay_${name}`);

export const createdAt = timestamp("created_at", { mode: "date" }).notNull().defaultNow()
export const updatedAt = timestamp("updated_at", { mode: "date" })

export const columnId = varchar("id", { length: 255 }).notNull().primaryKey().$defaultFn(() => createId())