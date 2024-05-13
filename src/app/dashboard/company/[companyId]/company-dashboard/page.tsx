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
export default async function page() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user) {
    return <Title>No se encontró el usuario</Title>;
  }
  return (
    <div>
      <Title>
        Hola, <span className="text-[#8fefdc]"> {user.name!}!</span>
      </Title>

      <div>
        <Card>
          <CardContent className="flex w-full flex-wrap items-center gap-7">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full bg-[#1bdfb7]"
              >
                <HandCoins className="h-6 w-6" />
              </Button>
              <div className="text-sm font-semibold">
                Generación de Recaudación
              </div>
            </div>

            <div className="flex  items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className=" h-9 w-9 rounded-full bg-[#1bdfb7]"
              >
                <ArrowLeftRight className="h-6 w-6" />
              </Button>
              <div className="flex flex-col  text-sm font-semibold">
                <span> Transacciones de la fecha</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className=" h-10 w-10 rounded-full bg-[#1bdfb7]"
              >
                <LogOut className="h-6 w-6" />
              </Button>
              <div className="text-sm font-semibold">
                Información de facturación
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className=" h-10 w-10 rounded-full bg-[#1bdfb7]"
              >
                <Import className="h-6 w-6" />
              </Button>
              <div className="text-sm font-semibold">
                Solicitar transferencia
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-xl font-semibold  ">
          Saldo en <span className="text-[#8fefdc]">cuenta</span>
        </h2>
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
    </div>
  );
}
