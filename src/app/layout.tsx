import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Montserrat, Roboto } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { cookies } from "next/headers";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Toaster } from "~/components/ui/sonner";
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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl={"/dashboard"}>
      <html lang="es">
        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
        <body className={`text-[#3E3E3E] font-family ${montserrat.className}`}>
          <TRPCReactProvider cookies={cookies().toString()}>
            {props.children}
            <Toaster />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
