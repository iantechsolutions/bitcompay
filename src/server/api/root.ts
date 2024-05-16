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
import { integrantsRouter } from "./routers/integrant-router";
import { paymentHoldersRouter } from "./routers/paymentHolders.router";
import { billResponsibleRouter } from "./routers/billResponsive-router";
import { facturasRouter } from "./routers/factura-router";
import { modosRouter } from "./routers/modo.router";
import { prospectsRouter } from "./routers/prospects.router";
import { procedureRouter } from "./routers/procedure.router";
import { bonusesRouter } from "./routers/bonuses.router";
import { administrative_auditRouter } from "./routers/administrative_audit-router";
import { medical_auditRouter } from "./routers/medical_audit-router";
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
  integrants: integrantsRouter,
  paymentHolders: paymentHoldersRouter,
  billResponsible: billResponsibleRouter,
  facturas: facturasRouter,
  modos: modosRouter,
  prospects: prospectsRouter,
  procedure: procedureRouter,
  bonuses: bonusesRouter,
  administrative_audit: administrative_auditRouter,
  medical_audit: medical_auditRouter

});

// export type definition of API
export type AppRouter = typeof appRouter;
