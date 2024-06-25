import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin-ext"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Bitcompay",
  description: "Sistema de gestión de Bitcompay",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl={"/dashboard"}>
      <html lang="es">
        {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
        <body className={`font-family ${roboto.className}`}>
          {props.children}
        </body>
      </html>
    </ClerkProvider>
  );
}
