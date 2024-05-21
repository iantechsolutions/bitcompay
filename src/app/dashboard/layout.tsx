import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider cookies={cookies().toString()}>
      {props.children}
      <Toaster />
    </TRPCReactProvider>
  );
}
