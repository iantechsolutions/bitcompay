import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { columnId, createdAt, pgTable, updatedAt } from "./schema/util";

export * from './schema/auth';
export { pgTable } from './schema/util';

export const documentUploads = pgTable(
  "document_upload",
  {
    id: columnId,
    userId: varchar("userId", { length: 255 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: integer("fileSize").notNull(),

    confirmed: boolean("confirmed").notNull().default(false),
    confirmedAt: timestamp("confirmedAt", { mode: "date" }),

    documentType: varchar("documentType", { length: 255 }).$type<'rec' | null>(),

    createdAt,
    updatedAt,
  },
  (documentUploads) => ({
    userIdIdx: index("docuemnt_upload_userId_idx").on(documentUploads.userId),
  })
);

export const payments = pgTable(
  "payment",
  {
    id: columnId,
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
    //! Can be used as id
    invoice_number: bigint("invoice_number", { mode: 'number' }).notNull().unique(),
    //
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

    createdAt,
    updatedAt,
  },
  (payments) => ({
    userIdIdx: index("payment_userId_idx").on(payments.userId),
    documentUploadIdIdx: index("documentUploadId_idx").on(payments.documentUploadId),
    invoiceNumberIdx: index("invoiceNumber_idx").on(payments.invoice_number),
  })
);

export const channels = pgTable(
  "channel",
  {
    id: columnId,
    number: integer("number").notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(true),

    requiredColumns: json("required_columns").$type<string[]>().notNull().default([]),

    createdAt,
    updatedAt,
  },
  (channels) => ({
    nameIdx: index("channel_name_idx").on(channels.name),
    numberIdx: index("number_idx").on(channels.number),
  })
);

export const channelsRelations = relations(channels, ({ one, many }) => ({
  companies: many(companyChannels),
}));

export const companies = pgTable(
  "company",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(true),

    createdAt,
    updatedAt,
  },
  (companies) => ({
    nameIdx: index("company_name_idx").on(companies.name),
  })
);

export const companiesRelations = relations(companies, ({ one, many }) => ({
  brands: many(brands),
  channels: many(companyChannels),
}));

export const brands = pgTable(
  "brand",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    companyId: varchar("companyId", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(true),

    createdAt,
    updatedAt,
  },
  (brands) => ({
    nameIdx: index("brand_name_idx").on(brands.name),
    companyIdIdx: index("companyId_idx").on(brands.companyId),
  })
);

export const brandsRelations = relations(brands, ({ one, many }) => ({
  company: one(companies, { fields: [brands.companyId], references: [companies.id] }),
}));

export const companyChannels = pgTable(
  'company_channel',
  {
    companyId: varchar("brandId", { length: 255 }).notNull(),
    channelId: varchar("channelId", { length: 255 }).notNull(),
  },
  (brandChannels) => ({
    pk: primaryKey({
      name: 'company_channel_pk',
      columns: [brandChannels.companyId, brandChannels.channelId],
    }),
  })
);

export const companyChannelsRelations = relations(companyChannels, ({ one, many }) => ({
  company: one(companies, { fields: [companyChannels.companyId], references: [companies.id] }),
  channel: one(channels, { fields: [companyChannels.channelId], references: [channels.id] }),
}));


export const companyProducts = pgTable(
  'company_product',
  {
    companyId: varchar("company_id", { length: 255 }).notNull(),
    productId: varchar("product_id", { length: 255 }).notNull(),
  },
  (companyProducts) => ({
    pk: primaryKey({
      name: 'company_product_pk',
      columns: [companyProducts.companyId, companyProducts.productId],
    }),
  })
);

export const companyProductsRelations = relations(companyProducts, ({ one, many }) => ({
  company: one(companies, { fields: [companyProducts.companyId], references: [companies.id] }),
  product: one(products, { fields: [companyProducts.productId], references: [products.id] }),
}));

export const products = pgTable(
  "product",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(true),

    createdAt,
    updatedAt,
  },
  (products) => ({
    nameIdx: index("product_name_idx").on(products.name),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  company: many(companyProducts),
  channels: many(productChannels),
}));

export const productChannels = pgTable(
  'product_channel',
  {
    productId: varchar("product_id", { length: 255 }).notNull(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
  },
  (productChannels) => ({
    pk: primaryKey({
      name: 'product_channel_pk',
      columns: [productChannels.productId, productChannels.channelId],
    }),
  })
);
