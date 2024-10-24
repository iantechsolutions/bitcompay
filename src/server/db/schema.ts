import { Table, relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  real,
  primaryKey,
  timestamp,
  varchar,
  serial,
} from "drizzle-orm/pg-core";
import {
  columnId,
  createdAt,
  pgTable,
  updatedAt,
} from "~/server/db/schema/util";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { literal, number, type z } from "zod";
import { he } from "date-fns/locale";
import { date } from "drizzle-orm/mysql-core";

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
  })
);

export const documentUploadsRelations = relations(
  documentUploads,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [documentUploads.companyId],
      references: [companies.id],
    }),
    payments: many(payments),
  })
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
  })
);

export const paymentStatus = pgTable("payment_status", {
  id: columnId,
  code: varchar("code", { length: 2 }),
  description: varchar("description", { length: 255 }),
});

export const payment_status_relations = relations(
  paymentStatus,
  ({ many }) => ({
    payments: many(payments),
  })
);

export const payments = pgTable(
  "payment",
  {
    id: columnId,
    userId: varchar("userId", { length: 255 }).notNull(),
    documentUploadId: varchar("document_upload_id", { length: 255 }),
    responseDocumentId: varchar("response_document_upload_id", { length: 255 }),
    // Rec fields
    g_c: bigint("g_c", { mode: "number" }),
    name: varchar("name", { length: 255 }),
    fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
    fiscal_id_number: bigint("fiscal_id_number", { mode: "number" }),
    du_type: varchar("du_type", { length: 255 }),
    du_number: bigint("du_number", { mode: "number" }),
    affiliate_number: varchar("affiliate_number", { length: 255 }),
    product: varchar("product", { length: 255 }),
    product_number: integer("product_number").references(() => products.number),
    //! Can be used as id
    invoice_number: bigint("invoice_number", { mode: "number" }).notNull(),
    //
    period: timestamp("period", { mode: "date" }),
    first_due_amount: real("first_due_amount"),
    first_due_date: timestamp("first_due_date", { mode: "date" }),
    second_due_amount: real("second_due_amount"),
    second_due_date: timestamp("second_due_date", { mode: "date" }),
    additional_info: varchar("additional_info", { length: 255 }),
    payment_channel: varchar("payment_channel", { length: 255 }),
    payment_date: timestamp("payment_date", { mode: "date" }),
    collected_amount: real("collected_amount"),
    cbu: varchar("cbu", { length: 22 }).default(" "),
    card_brand: varchar("card_brand", { length: 255 }),
    card_number: varchar("card_number", { length: 255 }),
    card_type: varchar("card_type", { length: 255 }), // tipo de tarjeta
    is_new: boolean("is_new").notNull().default(false),
    // end Rec fields

    recollected_amount: real("recollected_amount"),
    companyId: varchar("companyId", { length: 255 })
      .notNull()
      .references(() => companies.id),

    statusId: varchar("statusId", { length: 255 }),
    outputFileId: varchar("output_file_id", { length: 255 }),
    genChannels: json("gen_channels").$type<string[]>().notNull().default([]),
    createdAt,
    updatedAt,
    comprobante_id: varchar("comprobante_id", { length: 255 }).references(
      () => comprobantes.id
    ),
  },
  (payments) => ({
    userIdIdx: index("payment_userId_idx").on(payments.userId),
    // documentUploadIdIdx: index("documentUploadId_idx").on(
    //   payments.documentUploadId
    // ),
    invoiceNumberIdx: index("invoiceNumber_idx").on(payments.invoice_number),
  })
);

export const selectPaymentSchema = createSelectSchema(payments);
export type Payment = z.infer<typeof selectPaymentSchema>;

export const paymentsRelations = relations(payments, ({ one }) => ({
  documentUpload: one(documentUploads, {
    fields: [payments.documentUploadId],
    references: [documentUploads.id],
  }),
  responseDocumentUpload: one(responseDocumentUploads, {
    fields: [payments.responseDocumentId],
    references: [responseDocumentUploads.id],
  }),
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  product: one(products, {
    fields: [payments.product_number],
    references: [products.number],
  }),
  status: one(paymentStatus, {
    fields: [payments.statusId],
    references: [paymentStatus.id],
  }),
  outputFile: one(uploadedOutputFiles, {
    fields: [payments.outputFileId],
    references: [uploadedOutputFiles.id],
  }),
  comprobantes: one(comprobantes, {
    fields: [payments.comprobante_id],
    references: [comprobantes.id],
  }),
  channel: one(channels, {
    fields: [payments.payment_channel],
    references: [channels.id],
  }),
}));

export const channels = pgTable(
  "channel",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    number: serial("number"),
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
    // numberIdx: index("number_idx").on(channels.number),
  })
);

export const channelsRelations = relations(channels, ({ many }) => ({
  products: many(productChannels),
}));

export const companies = pgTable(
  "company",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    concept: varchar("concept", { length: 255 }).notNull().default("concept"),
    enabled: boolean("enabled").notNull().default(true),
    afipKey: varchar("afipKey"),
    certificate: varchar("certificate"),
    cuit: varchar("cuit"),
    razon_social: varchar("razon_social"),
    address: varchar("address"),
    afip_condition: varchar("afip_condition"),
    activity_start_date: timestamp("activity_start_date", { mode: "date" }),
    createdAt,
    updatedAt,
  },
  (companies) => ({
    nameIdx: index("company_name_idx").on(companies.name),
  })
);

export const companiesRelations = relations(companies, ({ many }) => ({
  brands: many(companiesToBrands),
  products: many(companyProducts),
  bussinessUnits: many(bussinessUnits),
  plans: many(plans),
}));
export const selectCompanySchema = createSelectSchema(companies);
export type Company = z.infer<typeof selectCompanySchema>;

export const brands = pgTable(
  "brand",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    redescription: varchar("redescription", { length: 10 })
      .notNull()
      .default(""),
    iva: varchar("iva"),
    bill_type: varchar("bill_type"),
    concept: varchar("concept"),
    companyId: varchar("companyId", { length: 255 }),
    enabled: boolean("enabled").notNull().default(true),
    createdAt,
    updatedAt,
    logo_url: varchar("logo_url"),
    prisma_code: varchar("prisma_code", { length: 4 }),
    utility: varchar("utility", { length: 8 }),
    number: serial("number"),
    pv: varchar("pv"),
  },
  (brands) => ({
    nameIdx: index("brand_name_idx").on(brands.name),
    companyIdIdx: index("companyId_idx").on(brands.companyId),
  })
);

export const brandsRelations = relations(brands, ({ many }) => ({
  company: many(companiesToBrands),
  plansList: many(plans),
  establishments: many(establishments),
}));

export const companiesToBrands = pgTable(
  "companiesToBrands",
  {
    companyId: varchar("company_id").notNull(),
    brandId: varchar("brand_id").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.companyId, t.brandId),
  })
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
  })
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
  })
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
  })
);

export const products = pgTable(
  "product",
  {
    id: columnId,
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    number: serial("number").unique(),

    enabled: boolean("enabled").notNull().default(true),

    createdAt,
    updatedAt,
  },
  (products) => ({
    nameIdx: index("product_name_idx").on(products.name),
  })
);

export const productsRelations = relations(products, ({ many }) => ({
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
  })
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
  })
);

export const uploadedOutputFiles = pgTable("uploaded_output_files", {
  id: columnId,
  userId: varchar("userId", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: integer("fileSize").notNull(),

  channelId: varchar("channelId", { length: 255 }).notNull(),
  companyId: varchar("companyId", { length: 255 }).notNull(),
  brandId: varchar("brandId", { length: 255 }).notNull(),

  createdAt,
});

export const providers = pgTable(
  "providers",
  {
    id: columnId,
    user: varchar("user", { length: 255 }).notNull(),
    createdAt,
    provider_type: varchar("provider_type", { length: 255 }),
    supervisor: varchar("supervisor", { length: 255 }),
    manager: varchar("manager", { length: 255 }),
    provider_code: varchar("provider_code", { length: 255 }),
    id_type: varchar("id_type", { length: 255 }),
    id_number: varchar("id_number", { length: 255 }),
    name: varchar("name", { length: 255 }),
    afip_status: varchar("afip_status", { length: 255 }),
    fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
    fiscal_id_number: varchar("fiscal_id_number", { length: 255 }),
    gender: varchar("gender", { enum: ["female", "male", "other"] }),
    birth_date: timestamp("birth_date", { mode: "date" }),
    civil_status: varchar("civil_status", {
      enum: ["single", "married", "divorced", "widowed"],
    }),
    nationality: varchar("nationality", { length: 255 }),
    address: varchar("address", { length: 255 }),
    phone_number: varchar("phone_number", { length: 255 }),
    cellphone_number: varchar("cellphone_number", { length: 255 }),
    email: varchar("email", { length: 255 }),
    financial_entity: varchar("financial_entity", { length: 255 }),
    cbu: varchar("cbu", { length: 255 }),
    status: varchar("status", { length: 255 }),
    unsubscription_motive: varchar("unsubscription_motive", { length: 255 }),
  },
  (users) => ({
    userIdx: index("user_idx").on(users.user),
    emailIdx: index("email_idx").on(users.email),
  })
);

export const insertProvidersSchema = createInsertSchema(providers);
export const selectProvidersSchema = createSelectSchema(providers);
export const ProviderSchemaDB = insertProvidersSchema.pick({
  provider_type: true,
  supervisor: true,
  manager: true,
  provider_code: true,
  id_type: true,
  id_number: true,
  name: true,
  afip_status: true,
  fiscal_id_type: true,
  fiscal_id_number: true,
  gender: true,
  birth_date: true,
  civil_status: true,
  nationality: true,
  address: true,
  phone_number: true,
  cellphone_number: true,
  email: true,
  financial_entity: true,
  cbu: true,
  status: true,
  unsubscription_motive: true,
});
export type Providers = z.infer<typeof selectProvidersSchema>;

export const plans = pgTable("plans", {
  id: columnId,
  user: varchar("user", { length: 255 }).notNull(),
  createdAt,
  // validy_date: timestamp("vigency_date").notNull(),
  plan_code: varchar("plan_code", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  brand_id: varchar("brand_id", { length: 255 }).references(() => brands.id),
  companies_id: varchar("companies_id", { length: 255 }).references(
    () => companies.id
  ),
});

export const plansRelations = relations(plans, ({ many, one }) => ({
  pricesPerCondition: many(pricePerCondition),
  brands: one(brands, {
    fields: [plans.brand_id],
    references: [brands.id],
  }),
  companies: one(companies, {
    fields: [plans.companies_id],
    references: [companies.id],
  }),
}));

export const bussinessUnits = pgTable("bussiness_units", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
  createdAt,
  brandId: varchar("brandId", { length: 255 })
    .notNull()
    .references(() => brands.id),
  companyId: varchar("companyId", { length: 255 })
    .notNull()
    .references(() => companies.id),
});

export const bussinessUnitsRelations = relations(
  bussinessUnits,
  ({ one, many }) => ({
    brand: one(brands, {
      fields: [bussinessUnits.brandId],
      references: [brands.id],
    }),
    company: one(companies, {
      fields: [bussinessUnits.companyId],
      references: [companies.id],
    }),
    // plans: many(plans),
    ls: many(liquidations),
  })
);

export const healthInsurances = pgTable("health_insurances", {
  id: columnId,
  companyId: varchar("companyId", { length: 255 }).references(
    () => companies.id
  ),
  name: varchar("name", { length: 255 }).notNull(),
  identificationNumber: varchar("identificationNumber", { length: 255 }),
  description: varchar("description", { length: 255 }),
  isClient: boolean("isClient").notNull().default(false),
  fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
  fiscal_id_number: varchar("fiscal_id_number"),
  responsibleName: varchar("responsibleName", { length: 255 }),
  adress: varchar("adress", { length: 255 }),
  locality: varchar("locality", { length: 255 }),
  province: varchar("province", { length: 255 }),
  afip_status: varchar("afip_status", { length: 255 }),
  postal_code: varchar("postal_code", { length: 255 }).references(
    () => postal_code.id
  ),
  initials: varchar("initials", { length: 255 }),
  businessUnit: varchar("businessUnit", { length: 255 }),
  businessName: varchar("businessName", { length: 255 }),
  fiscalAddress: varchar("fiscalAddress", { length: 255 }),
  fiscalFloor: varchar("fiscalFloor", { length: 255 }),
  fiscalOffice: varchar("fiscalOffice", { length: 255 }),
  fiscalLocality: varchar("fiscalLocality", { length: 255 }),
  fiscalProvince: varchar("fiscalProvince", { length: 255 }),
  fiscalPostalCode: varchar("fiscalPostalCode", { length: 255 }),
  fiscalCountry: varchar("fiscalCountry", { length: 255 }),
  IIBBStatus: varchar("IIBBStatus", { length: 255 }),
  IIBBNumber: varchar("IIBBNumber", { length: 255 }),
  sellCondition: varchar("sellCondition", { length: 255 }),
  phoneNumber: varchar("phoneNumber", { length: 255 }),
  email: varchar("email", { length: 255 }),
  state: varchar("state", { length: 255 }),
  user: varchar("user", { length: 255 }),
  cancelMotive: varchar("cancelMotive", { length: 255 }),
  floor: varchar("floor", { length: 255 }),
  office: varchar("office", { length: 255 }),
  dateState: timestamp("dateState", { mode: "date" }),
  excelDocument: varchar("excelDocument", { length: 255 }),
  excelAmount: varchar("excelAmount"),
  excelEmployerDocument: varchar("excelEmployerDocument", { length: 255 }),
  excelSupportPeriod: varchar("excelSupportPeriod", { length: 255 }),
  excelContributionperiod: varchar("excelContributionperiod", { length: 255 }),
});

export const healthInsurancesRelations = relations(
  healthInsurances,
  ({ one, many }) => ({
    cpData: one(postal_code, {
      fields: [healthInsurances.postal_code],
      references: [postal_code.id],
    }),
    comprobantes: many(comprobantes),
    cc: one(currentAccount),
    aportes_os: many(aportes_os),
  })
);

export const clientStatuses = pgTable("client_statuses", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
});

export const modos = pgTable("modos", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
});

export const abonos = pgTable("abonos", {
  id: columnId,
  valor: real("valor").notNull(),
  createdAt,
  family_group: varchar("family_group", { length: 255 }).references(
    () => family_groups.id
  ),
});

export const abonosRelations = relations(abonos, ({ one }) => ({
  family_group: one(family_groups, {
    fields: [abonos.family_group],
    references: [family_groups.id],
  }),
}));

export const integrants = pgTable("integrant", {
  id: columnId,
  iva: varchar("iva", { length: 255 }),
  affiliate_type: varchar("affiliate_type", { length: 255 }),
  relationship: varchar("relationship", { length: 255 }),
  name: varchar("name", { length: 255 }),
  id_type: varchar("id_type", { length: 255 }),
  id_number: varchar("id_number", { length: 255 }),
  birth_date: timestamp("birth_date", { mode: "date" }),
  gender: varchar("gender", { enum: ["MASCULINO", "FEMENINO", "OTRO"] }),
  civil_status: varchar("civil_status", {
    enum: ["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO"],
  }),
  nationality: varchar("nationality", { length: 255 }),
  afip_status: varchar("afip_status", { length: 255 }),
  fiscal_id_type: varchar("fiscal_id_type", { length: 255 }),
  fiscal_id_number: varchar("fiscal_id_number", { length: 255 }),
  address: varchar("address", { length: 255 }),
  address_number: varchar("address_number", { length: 255 }),
  phone_number: varchar("phone_number", { length: 255 }),
  cellphone_number: varchar("cellphone_number", { length: 255 }),
  email: varchar("email", { length: 255 }),
  floor: varchar("floor", { length: 255 }),
  department: varchar("department", { length: 255 }),
  locality: varchar("locality", { length: 255 }),
  partido: varchar("partido", { length: 255 }),
  state: varchar("state", { length: 255 }),
  province: varchar("province", { length: 255 }),
  cp: varchar("cp", { length: 255 }),
  zone: varchar("zone", { length: 255 }),
  isHolder: boolean("isHolder").notNull().default(false),
  isPaymentHolder: boolean("isPaymentHolder").notNull().default(false),
  isAffiliate: boolean("isAffiliate").notNull().default(false),
  isBillResponsible: boolean("isBillResponsible").notNull().default(false),
  age: integer("age"),
  family_group_id: varchar("family_group_id", { length: 255 }).references(
    () => family_groups.id
  ),
  affiliate_number: varchar("affiliate_number", { length: 255 }),
  extention: varchar("extention", { length: 255 }),
  postal_codeId: varchar("postalcodeid").references(() => postal_code.id),
  health_insuranceId: varchar("health_insuranceId", { length: 255 }).references(
    () => healthInsurances.id
  ),
  originating_health_insuranceId: varchar("originating_health_insuranceId", {
    length: 255,
  }).references(() => healthInsurances.id),
  validity: timestamp("validity", { mode: "date" }),
});

export const integrantsRelations = relations(integrants, ({ one, many }) => ({
  family_group: one(family_groups, {
    fields: [integrants.family_group_id],
    references: [family_groups.id],
  }),
  postal_code: one(postal_code, {
    fields: [integrants.postal_codeId],
    references: [postal_code.id],
  }),
  healthInsurances: one(healthInsurances, {
    fields: [integrants.health_insuranceId],
    references: [healthInsurances.id],
  }),
  originatingHealthInsurances: one(healthInsurances, {
    fields: [integrants.originating_health_insuranceId],
    references: [healthInsurances.id],
  }),
  pa: many(pa),
  aportes_os: many(aportes_os),
  differentialsValues: many(differentialsValues),
}));

export const insertintegrantSchema = createInsertSchema(integrants);
export const selectintegrantSchema = createSelectSchema(integrants);
export const integrantSchemaDB = insertintegrantSchema.pick({
  affiliate_type: true,
  relationship: true,
  name: true,
  id_type: true,
  id_number: true,
  birth_date: true,
  gender: true,
  civil_status: true,
  iva: true,
  address_number: true,
  nationality: true,
  afip_status: true,
  fiscal_id_type: true,
  fiscal_id_number: true,
  address: true,
  phone_number: true,
  cellphone_number: true,
  email: true,
  floor: true,
  department: true,
  locality: true,
  partido: true,
  state: true,
  cp: true,
  zone: true,
  isHolder: true,
  isPaymentHolder: true,
  isAffiliate: true,
  isBillResponsible: true,
  postal_codeId: true,
  province: true,
  age: true,
  extention: true,
  family_group_id: true,
  health_insuranceId: true,
  originating_health_insuranceId: true,
  affiliate_number: true,
});
export type Integrant = z.infer<typeof selectintegrantSchema>;

export const differentials = pgTable("differentials", {
  id: columnId,
  codigo: varchar("codigo", { length: 255 }).notNull(),
});

export const differentialsRelations = relations(differentials, ({ many }) => ({
  values: many(differentialsValues),
}));

export const differentialsValues = pgTable("differentialsValues", {
  id: columnId,
  amount: real("amount").notNull(),
  createdAt,
  differentialId: varchar("differentialId", { length: 255 }).references(
    () => differentials.id
  ),
  integrant_id: varchar("integrant_id", { length: 255 }).references(
    () => integrants.id
  ),
});

export const differentialsValuesRelations = relations(
  differentialsValues,
  ({ one }) => ({
    differential: one(differentials, {
      fields: [differentialsValues.differentialId],
      references: [differentials.id],
    }),
    integrant: one(integrants, {
      fields: [differentialsValues.integrant_id],
      references: [integrants.id],
    }),
  })
);

export const comprobantes = pgTable("comprobantes", {
  id: columnId,
  createdAt,
  generated: timestamp("generated", { mode: "date" }).default(new Date()),
  ptoVenta: integer("ptoVenta").notNull(),
  nroComprobante: integer("nroComprobante").notNull(),
  tipoComprobante: varchar("tipoComprobante", { length: 255 }),
  concepto: integer("concept").notNull(),
  tipoDocumento: integer("tipoDocumento").notNull(),
  nroDocumento: bigint("nroDocumento", {
    mode: "number",
  }).notNull(),
  importe: real("importe").notNull(),
  fromPeriod: timestamp("fromperiod", { mode: "date" }),
  toPeriod: timestamp("toperiod", { mode: "date" }),
  due_date: timestamp("due_date", { mode: "date" }),
  // second_due_date: timestamp("second_due_date", { mode: "date" }),
  payedDate: timestamp("payedDate", { mode: "date" }),
  prodName: varchar("prodName", { length: 255 }).notNull(),
  iva: varchar("iva", { length: 255 }).notNull(),
  billLink: varchar("billLink", { length: 255 }).notNull(),
  afipError: varchar("afipError", { length: 255 }),
  estado: varchar("estado", {
    enum: [
      "Generada",
      "Pendiente",
      "Pagada",
      "Parcial",
      "Anulada",
      "Apertura",
      "Error",
    ],
  }),
  origin: varchar("origin", {
    enum: [
      "Factura",
      "Nota de credito",
      "Recibo",
      "Nota de debito",
      "anulada",
      "apertura",
    ],
  }),
  liquidation_id: varchar("liquidation_id", { length: 255 }).references(
    () => liquidations.id
  ),
  family_group_id: varchar("family_group_id", { length: 255 }),
  health_insurance_id: varchar("health_insurance_id", { length: 255 }),
  // .references(
  //   () => family_groups.id
  // ),
  previous_facturaId: varchar("previous_factura", { length: 255 }),
});

export const comprobantesRelations = relations(
  comprobantes,
  ({ one, many }) => ({
    items: many(items),
    otherTributes: many(otherTributes),
    liquidations: one(liquidations, {
      fields: [comprobantes.liquidation_id],
      references: [liquidations.id],
    }),
    payments: many(payments),
    family_group: one(family_groups, {
      fields: [comprobantes.family_group_id],
      references: [family_groups.id],
    }),
    anterior: one(comprobantes, {
      fields: [comprobantes.previous_facturaId],
      references: [comprobantes.id],
    }),
    healthInsurances: one(healthInsurances, {
      fields: [comprobantes.health_insurance_id],
      references: [healthInsurances.id],
    }),
  })
);

export const insertComprobantesSchema = createInsertSchema(comprobantes);
export const selectComprobantesSchema = createSelectSchema(comprobantes);
export const ComprobantesSchemaDB = insertComprobantesSchema.pick({
  generated: true,
  estado: true,
  health_insurance_id: true,
  createdAt: true,
  billLink: true,
  concepto: true,
  tipoComprobante: true,
  tipoDocumento: true,
  nroDocumento: true,
  importe: true,
  fromPeriod: true,
  toPeriod: true,
  due_date: true,
  payedDate: true,
  prodName: true,
  iva: true,
  ptoVenta: true,
  nroComprobante: true,
  liquidation_id: true,
  family_group_id: true,
  origin: true,
  previous_facturaId: true,
});
export type Comprobante = z.infer<typeof selectComprobantesSchema>;

export const items = pgTable("items", {
  id: columnId,
  concept: varchar("concept", { length: 255 }),
  amount: real("amount"),
  iva: real("iva"),
  total: real("total"),
  abono: real("abono"),
  tipoComprobante: varchar("tipoComprobante", { length: 255 }),
  comprobante_id: varchar("comprobante_id", { length: 255 }).references(
    () => comprobantes.id
  ),
  // differential_amount: real("differential_amount"),
  // account_payment: real("account_payment"),
  // bonificacion: real("bonificacion"),
  // interest: real("interest"),
  // contribution: real("contribution"),
  // previous_bill: real("previous_bill"),
});

export const itemsRelations = relations(items, ({ one }) => ({
  comprobantes: one(comprobantes, {
    fields: [items.comprobante_id],
    references: [comprobantes.id],
  }),
}));

export const family_groups = pgTable("family_groups", {
  id: columnId,
  businessUnit: varchar("businessUnit", { length: 255 }),
  validity: timestamp("validity", { mode: "date" }),
  plan: varchar("plan").references(() => plans.id),
  modo: varchar("modo").references(() => modos.id),
  receipt: varchar("receipt", { length: 255 }),
  bonus: varchar("bonus", { length: 255 }),
  procedureId: varchar("procedureId", { length: 255 }).references(
    () => procedure.id
  ),
  state: varchar("state", { length: 255 }),
  sale_condition: varchar("sale_condition", { length: 255 }),
  payment_status: varchar("payment_status", { length: 255 }).default("pending"),
  numericalId: serial("autoincrementNumber"),
  charged_date: timestamp("charged_date", { mode: "date" }),
  user_charged: varchar("user_charged", { length: 255 }),
  seller: varchar("seller", { length: 255 }),
  supervisor: varchar("supervisor", { length: 255 }),
  gerency: varchar("gerency", { length: 255 }),
});

export const family_groupsRelations = relations(
  family_groups,
  ({ one, many }) => ({
    businessUnitData: one(bussinessUnits, {
      fields: [family_groups.businessUnit],
      references: [bussinessUnits.id],
    }),
    plan: one(plans, {
      fields: [family_groups.plan],
      references: [plans.id],
    }),
    modo: one(modos, {
      fields: [family_groups.modo],
      references: [modos.id],
    }),
    bonus: many(bonuses),
    integrants: many(integrants),
    abonos: many(abonos),
    comprobantes: many(comprobantes),
    cc: one(currentAccount),
  })
);

export const insertfamily_groupsSchema = createInsertSchema(family_groups);
export const selectfamily_groupsSchema = createSelectSchema(family_groups);
export const family_groupsSchemaDB = insertfamily_groupsSchema.pick({
  businessUnit: true,
  validity: true,
  plan: true,
  modo: true,
  bonus: true,
  procedureId: true,
  numericalId: true,
  state: true,
  payment_status: true,
  receipt: true,
  seller: true,
  supervisor: true,
  gerency: true,
  sale_condition: true,
  user_charged: true,
  charged_date: true,
});
export type FamilyGroup = z.infer<typeof selectfamily_groupsSchema>;

export const bonuses = pgTable("bonuses", {
  id: columnId,
  appliedUser: varchar("appliedUser", { length: 255 }).notNull(),
  approverUser: varchar("approverUser", { length: 255 }).notNull(),
  validationDate: timestamp("validationDate", { mode: "date" }),
  duration: varchar("duration", { length: 255 }).notNull(),
  from: timestamp("from", { mode: "date" }),
  to: timestamp("to", { mode: "date" }),
  amount: varchar("mount", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  family_group_id: varchar("family_group_id", { length: 255 }),
});

export const bonusesRelations = relations(bonuses, ({ one }) => ({
  family_group: one(family_groups, {
    fields: [bonuses.family_group_id],
    references: [family_groups.id],
  }),
}));

export const insertBonusesSchema = createInsertSchema(bonuses);
export const selectBonusesSchema = createSelectSchema(bonuses);
export const bonusesSchemaDB = insertBonusesSchema.pick({
  appliedUser: true,
  approverUser: true,
  validationDate: true,
  duration: true,
  amount: true,
  reason: true,
  from: true,
  to: true,
  family_group_id: true,
});
export type Bonuses = z.infer<typeof selectBonusesSchema>;

export const procedure = pgTable("procedure", {
  id: columnId,
  type: varchar("type", { length: 255 }),
  estado: varchar("estado", { length: 255 }).notNull(),
  family_group: varchar("family_group"),
  companyId: varchar("companyId", { length: 255 })
    .notNull()
    .references(() => companies.id),
});

export const ProcedureRelations = relations(procedure, ({ many }) => ({
  medical_audits: many(medical_audit),
  administrative_audits: many(administrative_audit),
}));

export const insertProcedureSchema = createInsertSchema(procedure);
export const selectProcedureSchema = createSelectSchema(procedure);
export const ProcedureSchemaDB = insertProcedureSchema.pick({
  type: true,
  companyId: true,
  estado: true,
  family_group: true,
});
export type Procedure = z.infer<typeof selectProcedureSchema>;

export const medical_audit = pgTable("medical_audit", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  procedure_id: varchar("procedure", { length: 255 }),
});

export const medical_auditRelations = relations(medical_audit, ({ one }) => ({
  procedure: one(procedure, {
    fields: [medical_audit.procedure_id],
    references: [procedure.id],
  }),
}));

export const insertmedical_auditSchema = createInsertSchema(medical_audit);
export const selectmedical_auditSchema = createSelectSchema(medical_audit);
export const medical_auditSchemaDB = insertmedical_auditSchema.pick({
  description: true,
  state: true,
  procedure_id: true,
});
export type Medical_audit = z.infer<typeof selectmedical_auditSchema>;

export const administrative_audit = pgTable("administrative_audit", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  procedure_id: varchar("procedure", { length: 255 }),
});

export const administrative_auditRelations = relations(
  administrative_audit,
  ({ one }) => ({
    procedure: one(procedure, {
      fields: [administrative_audit.procedure_id],
      references: [procedure.id],
    }),
  })
);

export const insertadministrative_auditSchema =
  createInsertSchema(administrative_audit);
export const selectadministrative_auditSchema =
  createSelectSchema(administrative_audit);
export const administrative_auditSchemaDB =
  insertadministrative_auditSchema.pick({
    description: true,
    state: true,
    procedure_id: true,
  });
export type Administrative_audit = z.infer<
  typeof selectadministrative_auditSchema
>;

export const pa = pgTable("pa", {
  id: columnId,
  card_number: varchar("card_number", { length: 255 }),
  createdAt,
  expire_date: timestamp("expire_date", { mode: "date" }),
  CCV: varchar("CCV", { length: 255 }),
  CBU: varchar("CBU", { length: 255 }),
  card_brand: varchar("card_brand", { length: 255 }),
  card_type: varchar("card_type", { length: 255 }),
  new_registration: boolean("new_registration"),
  integrant_id: varchar("integrant_id", { length: 255 }).references(
    () => integrants.id
  ),
  product_id: varchar("product", { length: 255 }),
});

export const selectPaymentInfo = createSelectSchema(pa);
export type PaymentInfo = z.infer<typeof selectPaymentInfo>;

export const paRelations = relations(pa, ({ one }) => ({
  integrant: one(integrants, {
    fields: [pa.integrant_id],
    references: [integrants.id],
  }),
  product: one(products, {
    fields: [pa.product_id],
    references: [products.id],
  }),
}));

export const liquidations = pgTable("liquidations", {
  id: columnId,
  createdAt,
  updatedAt,
  brandId: varchar("brandId", { length: 255 }),
  userCreated: varchar("userCreated", { length: 255 }),
  userApproved: varchar("userApproved", { length: 255 }),
  estado: varchar("estado", { length: 255 }).notNull(),
  razon_social: varchar("razon_social", { length: 255 }),
  logo_url: varchar("logo_url"),
  cuit: varchar("cuit", { length: 255 }),
  pdv: integer("pdv").notNull(),
  period: timestamp("period", { mode: "date" }),
  number: integer("autoincrementNumber"),
  interest: real("interest"),
  bussinessUnits_id: varchar("bussinessUnits_id", { length: 255 }).references(
    () => bussinessUnits.id
  ),
});

export const liquidationsRelations = relations(
  liquidations,
  ({ one, many }) => ({
    bussinessUnits: one(bussinessUnits, {
      fields: [liquidations.bussinessUnits_id],
      references: [bussinessUnits.id],
    }),
    brand: one(brands, {
      fields: [liquidations.brandId],
      references: [brands.id],
    }),
    comprobantes: many(comprobantes),
  })
);

export const liquidations_counter = pgTable("liquidations_counter", {
  id: columnId,
  companies_id: varchar("companies_id", { length: 255 })
    .references(() => companies.id)
    .notNull(),
  number: integer("number").notNull(),
});

export const liquidations_counterRelations = relations(
  liquidations_counter,
  ({ one }) => ({
    companies: one(companies, {
      fields: [liquidations_counter.companies_id],
      references: [companies.id],
    }),
  })
);

export const insertliquidationsSchema = createInsertSchema(liquidations);
export const selectliquidationsSchema = createSelectSchema(liquidations);
export const liquidationsSchemaDB = selectliquidationsSchema.pick({
  createdAt: true,
  updatedAt: true,
  userCreated: true,
  userApproved: true,
  estado: true,
  razon_social: true,
  cuit: true,
  pdv: true,
  period: true,
  number: true,
});
export type liquidations = z.infer<typeof selectliquidationsSchema>;

export const billingDocuments = pgTable("billingDocuments", {
  id: columnId,
  url: varchar("url", { length: 255 }).notNull(),
  comprobante_id: varchar("comprobante_id", { length: 255 }).references(
    () => comprobantes.id
  ),
});

export const billingDocumentsRelations = relations(
  billingDocuments,
  ({ one, many }) => ({
    comprobantes: one(comprobantes, {
      fields: [billingDocuments.comprobante_id],
      references: [comprobantes.id],
    }),
  })
);

export const insertbillingDocumentsSchema =
  createInsertSchema(billingDocuments);
export const selectbillingDocumentsSchema =
  createSelectSchema(billingDocuments);
export const billingDocumentsSchemaDB = selectbillingDocumentsSchema.pick({
  url: true,
  comprobante_id: true,
});
export type billingDocuments = z.infer<typeof selectbillingDocumentsSchema>;

export const excelBilling = pgTable("excel_billing", {
  id: columnId,
  userId: varchar("userId", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  documentType: varchar("documentType", { length: 255 }).$type<"rec" | null>(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  companyId: varchar("companyId", { length: 255 })
    .notNull()
    .references(() => companies.id),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmedAt", { mode: "date" }),
  createdAt,
  updatedAt,
});

export const insertExcelBillingSchema = createInsertSchema(excelBilling);
export const selectExcelBillingSchema = createSelectSchema(excelBilling);
export const excelBillingSchemaDB = selectExcelBillingSchema.pick({
  id: true,
  url: true,
});
export type ExcelBilling = z.infer<typeof selectExcelBillingSchema>;

export const pricePerCondition = pgTable("pricePerCondition", {
  id: columnId,
  validy_date: timestamp("vigency_date").notNull(),
  from_age: integer("from_age"),
  to_age: integer("to_age"),
  condition: varchar("condition"),
  createdAt,
  isAmountByAge: boolean("isAmountByAge").notNull(),
  plan_id: varchar("plan_id", { length: 255 }).references(() => plans.id),
  amount: real("amount").notNull(),
});

export const pricePerConditionRelations = relations(
  pricePerCondition,
  ({ one, many }) => ({
    plans: one(plans, {
      fields: [pricePerCondition.plan_id],
      references: [plans.id],
    }),
  })
);

export const insertpricePerConditionSchema =
  createInsertSchema(pricePerCondition);
export const selectpricePerConditionSchema =
  createSelectSchema(pricePerCondition);
export const pricePerConditionSchemaDB = selectpricePerConditionSchema.pick({
  from_age: true,
  to_age: true,
  condition: true,
  isAmountByAge: true,
  amount: true,
  plan_id: true,
  createdAt: true,
  validy_date: true,
});
export type pricePerCondition = z.infer<typeof selectpricePerConditionSchema>;

export const currentAccount = pgTable("currentAccount", {
  id: columnId,
  company_id: varchar("company_id", { length: 255 }).references(
    () => companies.id
  ),
  family_group: varchar("family_group"),
  health_insurance: varchar("health_insurance"),
});

export const currentAccountRelations = relations(
  currentAccount,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [currentAccount.company_id],
      references: [companies.id],
    }),
    family_groups: one(family_groups, {
      fields: [currentAccount.family_group],
      references: [family_groups.id],
    }),
    health_insurance: one(healthInsurances, {
      fields: [currentAccount.health_insurance],
      references: [healthInsurances.id],
    }),
    events: many(events),
  })
);

export const events = pgTable("events", {
  id: columnId,
  description: varchar("description", { length: 255 }).notNull(),
  type: varchar("type", { enum: ["NC", "FC", "REC"] }), //alta = rec
  currentAccount_id: varchar("currentAccount_id", { length: 255 }),
  comprobante_id: varchar("comprobante_id", { length: 255 }),
  event_amount: real("event_amount").notNull(),
  current_amount: real("current_amout").notNull(), // saldo post transaccion
  createdAt,
});

export const eventsRelations = relations(events, ({ one }) => ({
  currentAccount: one(currentAccount, {
    fields: [events.currentAccount_id],
    references: [currentAccount.id],
  }),
  comprobantes: one(comprobantes, {
    fields: [events.comprobante_id],
    references: [comprobantes.id],
  }),
}));

export const postal_code = pgTable("postalcodes", {
  id: columnId,
  name: varchar("name", { length: 255 }).notNull(),
  cp: varchar("cp", { length: 255 }).notNull(),
  zone: varchar("zone", { length: 255 }).notNull(),
});

export const postal_codeRelations = relations(postal_code, ({ many, one }) => ({
  postal_code: many(integrants),
  zoneData: one(zone, {
    fields: [postal_code.zone],
    references: [zone.id],
  }),
}));

export const zone = pgTable("zone", {
  id: columnId,
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const establishments = pgTable("establishments", {
  id: columnId,
  establishment_number: bigint("establishment_number", {
    mode: "number",
  }).notNull(),
  flag: varchar("flag", { length: 255 }).notNull(),
  brandId: varchar("brandId", { length: 255 }).notNull(),
  createdAt,
});

export const establishmentsRelations = relations(establishments, ({ one }) => ({
  brand: one(brands, {
    fields: [establishments.brandId],
    references: [brands.id],
  }),
}));

export const selectEstablishmentSchema = createSelectSchema(establishments);
export type Establishment = z.infer<typeof selectEstablishmentSchema>;

export const relative = pgTable("relative", {
  id: columnId,
  relation: varchar("relation", { length: 255 }),
});

// export const relativeRelations = relations(
//   family_groups,
// );

export const insertrelativeSchema = createInsertSchema(relative);
export const selectrelativeSchema = createSelectSchema(relative);
// export const relativeSchemaDB = insertrelativeSchema.pick({
//   relation:true,
// })
export type Relative = z.infer<typeof selectrelativeSchema>;

export const aportes_os = pgTable("aportes_os", {
  id: columnId,
  id_affiliate: varchar("id_affiliate", { length: 255 })
    .references(() => integrants.id)
    .notNull(),
  cuil: varchar("cuil", { length: 255 }).notNull(),
  // type: varchar("type", { length: 255 }).notNull(),}
  // origen: varchar("origen", { length: 255 }).notNull(),
  process_date: timestamp("process_date", { mode: "date" }),
  contribution_date: timestamp("contribution_date", { mode: "date" }),
  support_date: timestamp("support_date", { mode: "date" }),
  amount: varchar("amount").notNull(),
  employer_document_number: varchar("employer_document_number", {
    length: 255,
  }),

  healthInsurances_id: varchar("healthInsurances_id", {
    length: 255,
  }).notNull(),
  createdAt,
});

export const aportes_os_Relations = relations(aportes_os, ({ one }) => ({
  healthInsurances: one(healthInsurances, {
    fields: [aportes_os.healthInsurances_id],
    references: [healthInsurances.id],
  }),
  affiliate: one(integrants, {
    fields: [aportes_os.id_affiliate],
    references: [integrants.id],
  }),
}));

export const otherTributes = pgTable("otherTributes", {
  id: columnId,
  tribute: varchar("tribute", { length: 255 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 255 }).notNull(),
  alicuota: real("alicuota").notNull(),
  base_imponible: real("base_imponible").notNull(),
  amount: real("amount").notNull(),
  comprobanteId: varchar("comprobanteId", { length: 255 }).references(
    () => comprobantes.id
  ),
});

export const otherTributesRelations = relations(otherTributes, ({ one }) => ({
  comprobantes: one(comprobantes, {
    fields: [otherTributes.comprobanteId],
    references: [comprobantes.id],
  }),
}));
