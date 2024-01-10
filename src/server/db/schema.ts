import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `bitcompay_${name}`);

export const roles = mysqlTable(
  "role",
  {
    id: varchar('id', { length: 25 }).primaryKey().notNull().unique(),
    name: varchar("name", { length: 256 }).notNull().unique(),
  },
  (roles) => ({
    nameIndex: index("name_idx").on(roles.name),
  })
);

export const rolesRelations = relations(roles, ({ one, many }) => ({
  permissions: many(rolePermissions),
  members: many(roleMemberhips),
}));

export const rolePermissions = mysqlTable(
  "role_permission",
  {
    roleId: bigint("roleId", { mode: "number" }).notNull(),
    permission: varchar("permission", { length: 256 }).notNull(),
  },
  (example) => ({
    compoundKey: primaryKey(example.roleId, example.permission),
  })
);

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
}));

export const roleMemberhips = mysqlTable(
  "role_membership",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    roleId: bigint("roleId", { mode: "number" }).notNull(),
  },
  (example) => ({
    compoundKey: primaryKey(example.userId, example.roleId),
  })
);

export const roleMemberhipsRelations = relations(
  roleMemberhips,
  ({ one, many }) => ({
    user: one(users, { fields: [roleMemberhips.userId], references: [users.id] }),
    role: one(roles, { fields: [roleMemberhips.roleId], references: [roles.id] }),
  })
);

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  roles: many(roleMemberhips),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export const documentUploads = mysqlTable(
  "document_upload",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: int("fileSize").notNull(),

    confirmed: boolean("confirmed").notNull().default(false),
    confirmedAt: timestamp("confirmedAt", { mode: "date" }),

    documentType: varchar("documentType", { length: 255 }).$type<'rec' | null>(),

    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (documentUploads) => ({
    userIdIdx: index("userId_idx").on(documentUploads.userId),
  })
);

export const payments = mysqlTable(
  "payment",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    documentUploadId: varchar("documentUploadId", { length: 255 }).notNull(),

    // Rec fields
    g_c: bigint("g_c", { mode: 'number' }),
    name: varchar("name", { length: 255 }),
    fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
    fiscal_id_number: bigint("fiscal_id_number", { mode: 'number' }),
    du_type: varchar("du_type", { length: 255 }),
    du_number: bigint("du_number", { mode: 'number' }),
    channel: varchar("channel", { length: 255 }),
    invoice_number: bigint("invoice_number", { mode: 'number' }),
    period: timestamp("period", { mode: "date" }),
    first_due_amount: bigint("first_due_amount", { mode: 'number' }),
    first_due_date: timestamp("first_due_date", { mode: "date" }),
    second_due_amount: bigint("second_due_amount", { mode: 'number' }),
    second_due_date: timestamp("second_due_date", { mode: "date" }),
    additional_info: varchar("additional_info", { length: 255 }),
    payment_channel: varchar("payment_channel", { length: 255 }),
    payment_date: timestamp("payment_date", { mode: "date" }),
    collected_amount: bigint("collected_amount", { mode: 'number' }),
    // end Rec fields

    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).onUpdateNow(),
  },
  (payments) => ({
    userIdIdx: index("userId_idx").on(payments.userId),
    documentUploadIdIdx: index("documentUploadId_idx").on(payments.documentUploadId),
  })
);

export const channels = mysqlTable(
  "channel",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    number: int("number").notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).onUpdateNow(),
  },
  (channels) => ({
    nameIdx: index("name_idx").on(channels.name),
    numberIdx: index("number_idx").on(channels.number),
  })
);