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

export * from "./schema/auth";
export { pgTable } from "./schema/util";

export const documentUploads = pgTable(
  "document_upload",
  {
    id: columnId,
    userId: varchar("userId", { length: 255 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: integer("fileSize").notNull(),
    rowsCount: integer("rowsCount"),

    confirmed: boolean("confirmed").notNull().default(false),
    confirmedAt: timestamp("confirmedAt", { mode: "date" }),

    documentType: varchar("documentType", { length: 255 }).$type<
      "rec" | null
    >(),

    companyId: varchar("companyId", { length: 255 })
      .notNull()
      .references(() => companies.id),

    createdAt,
    updatedAt,
  },
  (documentUploads) => ({
    userIdIdx: index("docuemnt_upload_userId_idx").on(documentUploads.userId),
  }),
);

export const documentUploadsRelations = relations(
  documentUploads,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [documentUploads.companyId],
      references: [companies.id],
    }),
    payments: many(payments),
  }),
);

export const responseDocumentUploads = pgTable("response_document_uploads", {
  id: columnId,
  userId: varchar("userId", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  rowsCount: integer("rowsCount"),

  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmedAt", { mode: "date" }),

  documentType: varchar("documentType", { length: 255 }).$type<"txt" | null>(),

  createdAt,
  updatedAt,
});
export const responseDocumentUploadsRelations = relations(
  responseDocumentUploads,
  ({ many }) => ({
    payments: many(payments),
  }),
);

export const payment_status = pgTable("payment_status", {
  statusId: varchar("statusId", { length: 2 }).primaryKey().default("99"),
  description: varchar("description", { length: 255 }),
});

export const payment_status_relations = relations(
  payment_status,
  ({ many }) => ({
    paymentes: many(payments),
  }),
);

export const payments = pgTable(
  "payment",
  {
    id: columnId,
    userId: varchar("userId", { length: 255 }).notNull(),
    documentUploadId: varchar("document_upload_id", { length: 255 })
      .notNull()
      .references(() => documentUploads.id),
    responseDocumentId: varchar("response_document_upload_id", { length: 255 }),
    // Rec fields
    g_c: bigint("g_c", { mode: "number" }),
    name: varchar("name", { length: 255 }),
    fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
    fiscal_id_number: bigint("fiscal_id_number", { mode: "number" }),
    du_type: varchar("du_type", { length: 255 }),
    du_number: bigint("du_number", { mode: "number" }),
    product: varchar("product", { length: 255 }),
    //
    product_number: integer("product_number")
      .notNull()
      .default(0)
      .references(() => products.number),
    //! Can be used as id
    invoice_number: bigint("invoice_number", { mode: "number" })
      .notNull()
      .unique(),
    //
    period: timestamp("period", { mode: "date" }),
    first_due_amount: bigint("first_due_amount", { mode: "number" }),
    first_due_date: timestamp("first_due_date", { mode: "date" }),
    second_due_amount: bigint("second_due_amount", { mode: "number" }),
    second_due_date: timestamp("second_due_date", { mode: "date" }),
    additional_info: varchar("additional_info", { length: 255 }),
    payment_channel: varchar("payment_channel", { length: 255 }),
    payment_date: timestamp("payment_date", { mode: "date" }),
    collected_amount: bigint("collected_amount", { mode: "number" }),
    cbu: varchar("cbu", { length: 22 }).default(" "),
    // end Rec fields

    companyId: varchar("companyId", { length: 255 })
      .notNull()
      .references(() => companies.id),
    status_code: varchar("status_code", { length: 255 }),

    createdAt,
    updatedAt,
  },
  (payments) => ({
    userIdIdx: index("payment_userId_idx").on(payments.userId),
    documentUploadIdIdx: index("documentUploadId_idx").on(
      payments.documentUploadId,
    ),
    invoiceNumberIdx: index("invoiceNumber_idx").on(payments.invoice_number),
  }),
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  documentUpload: one(documentUploads, {
    fields: [payments.documentUploadId],
    references: [documentUploads.id],
  }),
  responseDocumentUpload: one(responseDocumentUploads, { fields: [payments.responseDocumentId], references: [responseDocumentUploads.id] }),
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  product: one(products, {
    fields: [payments.product_number],
    references: [products.number],
  }),
  status_code: one(payment_status, {
    fields: [payments.status_code],
    references: [payment_status.statusId],
  }),
}));

export const channels = pgTable(
  "channel",
  {
    id: columnId,
    number: integer("number").notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    enabled: boolean("enabled").notNull().default(true),

    requiredColumns: json("required_columns")
      .$type<string[]>()
      .notNull()
      .default([]),

    createdAt,
    updatedAt,
  },
  (channels) => ({
    nameIdx: index("channel_name_idx").on(channels.name),
    numberIdx: index("number_idx").on(channels.number),
  }),
);

export const channelsRelations = relations(channels, ({ one, many }) => ({
  products: many(productChannels),
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
  }),
);

export const companiesRelations = relations(companies, ({ one, many }) => ({
  brands: many(companiesToBrands),
  products: many(companyProducts),
}));

export const brands = pgTable(
  "brand",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),

    redescription: varchar("redescription", { length: 10 })
      .notNull()
      .default(""),

    companyId: varchar("companyId", { length: 255 }),

    enabled: boolean("enabled").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (brands) => ({
    nameIdx: index("brand_name_idx").on(brands.name),
    companyIdIdx: index("companyId_idx").on(brands.companyId),
  }),
);

export const brandsRelations = relations(brands, ({ many }) => ({
  company: many(companiesToBrands),
}));

export const companiesToBrands = pgTable(
  "companiesToBrands",
  {
    companyId: varchar("company_id").notNull(),
    brandId: varchar("brand_id").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.companyId, t.brandId),
  }),
);

export const companiesToBrandsRelations = relations(
  companiesToBrands,
  ({ one }) => ({
    company: one(companies, {
      fields: [companiesToBrands.companyId],
      references: [companies.id],
    }),
    brand: one(brands, {
      fields: [companiesToBrands.brandId],
      references: [brands.id],
    }),
  }),
);

export const companyProducts = pgTable(
  "company_product",
  {
    companyId: varchar("company_id", { length: 255 }).notNull(),
    productId: varchar("product_id", { length: 255 }).notNull(),
  },
  (companyProducts) => ({
    pk: primaryKey({
      name: "company_product_pk",
      columns: [companyProducts.companyId, companyProducts.productId],
    }),
  }),
);

export const companyProductsRelations = relations(
  companyProducts,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyProducts.companyId],
      references: [companies.id],
    }),
    product: one(products, {
      fields: [companyProducts.productId],
      references: [products.id],
    }),
  }),
);

export const products = pgTable(
  "product",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    number: integer("number").notNull().unique(),

    enabled: boolean("enabled").notNull().default(true),

    createdAt,
    updatedAt,
  },
  (products) => ({
    nameIdx: index("product_name_idx").on(products.name),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  company: many(companyProducts),
  channels: many(productChannels),
}));

export const productChannels = pgTable(
  "product_channel",
  {
    productId: varchar("product_id", { length: 255 }).notNull(),
    channelId: varchar("channel_id", { length: 255 }).notNull(),
  },
  (productChannels) => ({
    pk: primaryKey({
      name: "product_channel_pk",
      columns: [productChannels.productId, productChannels.channelId],
    }),
  }),
);

export const productChannelsRelations = relations(
  productChannels,
  ({ one }) => ({
    product: one(products, {
      fields: [productChannels.productId],
      references: [products.id],
    }),
    channel: one(channels, {
      fields: [productChannels.channelId],
      references: [channels.id],
    }),
  }),
);

// tablas de vendedores, proveedores y clientes
