import { Title } from "~/components/title";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";

import { getServerAuthSession } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { HandCoins, LogOut, ArrowLeftRight, Import } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
export default async function page() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user) {
    return <Title>No se encontró el usuario</Title>;
  }
  return (
    <main className="ml-18 max-w-[1100px]">
      <Title>
        Hola, <span className="text-[#8fefdc]"> {user.name!}!</span>
      </Title>

      <section>
        <Card>
          <CardContent className="mt-5 flex w-full flex-wrap items-center gap-7">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className=" w-20 rounded-full bg-[#1bdfb7] p-3"
              >
                <HandCoins className="h-8 w-8" />
              </Button>
              <p className="text-md word-wrap overflow-wrap break-words font-semibold">
                Generación de Recaudación
              </p>
            </div>

            <div className="flex  items-center gap-3">
              <Button
                variant="outline"
                className=" rounded-full bg-[#1bdfb7] p-3"
              >
                <ArrowLeftRight className="h-10 w-10" />
              </Button>
              <p className="text-md flex  flex-col font-semibold">
                Transacciones de la fecha
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className=" rounded-full bg-[#1bdfb7] p-3"
              >
                <LogOut className="h-10 w-10" />
              </Button>
              <p className="text-md font-semibold">
                Información de facturación
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className=" rounded-full bg-[#1bdfb7] p-3"
              >
                <Import className="h-10 w-10" />
              </Button>
              <p className="text-md font-semibold">Solicitar transferencia</p>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="mt-4">
        <h2 className="mb-3 text-xl font-semibold  ">
          Saldo en <span className="text-[#8fefdc]">cuenta</span>
        </h2>
        <Card className="mt-3"> carta de saldo pendiente</Card>
      </section>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-">Resumen de cuenta</CardTitle>
          </CardHeader>
          <CardContent className="pl-2"></CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transacciones del dia</CardTitle>
            <CardDescription>
              Se han realizado 256 cobros este mes.
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </main>
  );
}
