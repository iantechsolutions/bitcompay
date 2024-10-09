import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Roboto } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Toaster } from "~/components/ui/sonner";
import AppLayout from "~/components/applayout";
import CompanySidenav from "~/components/company-sidenav";
import { CompanyProvider } from "./company-provider";
import { auth } from "@clerk/nextjs/server";
import { SetDefaultOrganization } from "./set-default-org";
import { checkRole } from "~/lib/utils/server/roles";
import { api } from "~/trpc/server";
import { getServerAuthSession } from "~/server/auth";
import { headers } from "next/headers";

dayjs.locale("es");
const montserrat = Montserrat({
  subsets: ["latin-ext"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Bitcompay",
  description: "Sistema de gestión de Bitcompay",
  icons: [{ rel: "icon", url: "/public/bitcom_icon.png" }],
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const session = await getServerAuthSession();
  const pathName = headers().get("x-invoke-path") || "/";
  if (!session || pathName.includes("signin")) {
    return (
      <ClerkProvider signInFallbackRedirectUrl={"/"}>
        <html lang="es">
          {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
          <body
            className={`text-[#3E3E3E] font-family ${montserrat.className}`}>
            <TRPCReactProvider cookies={cookies().toString()}>
              {props.children}
              <Toaster />
            </TRPCReactProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  }
  const { orgId } = auth();

  if (orgId || checkRole("admin")) {
    const company = await api.companies.get.query();

    return (
      <ClerkProvider signInFallbackRedirectUrl={"/dashboard"}>
        <html lang="es">
          {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
          <body
            className={`text-[#3E3E3E] font-family ${montserrat.className}`}>
            <TRPCReactProvider cookies={cookies().toString()}>
              <AppLayout
                headerClass="bg-white z-20"
                sidenavClass="top-0"
                sidenav={<CompanySidenav />}>
                {company && (
                  <CompanyProvider company={company}>
                    {props.children}
                  </CompanyProvider>
                )}
                {!company && checkRole("admin") && props.children}
              </AppLayout>
              <Toaster />
            </TRPCReactProvider>
          </body>
        </html>
      </ClerkProvider>
    );
  }
  return (
    <ClerkProvider signInFallbackRedirectUrl={"/dashboard"}>
      <html lang="es">
        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
        <body className={`text-[#3E3E3E] font-family ${montserrat.className}`}>
          <TRPCReactProvider cookies={cookies().toString()}>
            <SetDefaultOrganization />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
