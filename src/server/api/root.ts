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
});

// export type definition of API
export type AppRouter = typeof appRouter;
