import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import AuthProvider from "~/components/auth-provider";
import { Toaster } from "~/components/ui/sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TRPCReactProvider cookies={cookies().toString()}>
        {props.children}
        <Toaster />
      </TRPCReactProvider>
    </AuthProvider>
  );
}
