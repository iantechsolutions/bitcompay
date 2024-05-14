import { createTRPCRouter } from "~/server/api/trpc";
import { uploadsRouter } from "./routers/uploads-router";
import { channelsRouter } from "./routers/channels-router";
import { companiesRouter } from "./routers/companies-router";
import { transactionsRouter } from "./routers/transactions-router";
import { iofilesRouter } from "./routers/iofiles-routers";
import { productsChannel } from "./routers/products-router";
import { brandsRouter } from "./routers/brands-router";
import { statusRouter } from "./routers/status-router";
import { afipRouter } from "./routers/afip-router";
import { providersRouter } from "./routers/providers-router";
import { plansRouter } from "./routers/plans-router";
import { bussinessUnitsRouter } from "./routers/bussiness-units-router";
import { healthInsurancesRouter } from "./routers/health-insurances-router";
import { clientStatusesRouter } from "./routers/client-statuses-router";
import { integrant } from "../db/schema";
import { integrantRouter } from "./routers/integrant-router";
import { paymentHoldersRouter } from "./routers/paymentHolders.router";
import { billResponsibleRouter } from "./routers/billResponsive-router";
import { facturasRouter } from "./routers/factura-router";
import { modosRouter } from "./routers/modo.router";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  afip: afipRouter,
  uploads: uploadsRouter,
  channels: channelsRouter,
  products: productsChannel,
  companies: companiesRouter,
  transactions: transactionsRouter,
  iofiles: iofilesRouter,
  brands: brandsRouter,
  status: statusRouter,
  providers: providersRouter,
  plans: plansRouter,
  bussinessUnits: bussinessUnitsRouter,
  healthInsurances: healthInsurancesRouter,
  clientStatuses: clientStatusesRouter,
  integrant: integrantRouter,
  paymentHolders: paymentHoldersRouter,
  billResponsible: billResponsibleRouter,
  facturas: facturasRouter,
  modo: modosRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
