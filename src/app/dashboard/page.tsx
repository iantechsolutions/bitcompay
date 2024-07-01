import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeftRight, HandCoins, Import, LogOut } from "lucide-react";
import { EyeOff } from "lucide-react";
import { Clock9 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Overview } from "~/components/dashboard/overview";
import { RecentSales } from "~/components/dashboard/recent-sales";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
export default async function page() {
  const user = await currentUser();
  if (!user) {
    return <Title>No se encontró el usuario</Title>;
  }
  return (
    <main>
      <Title>
        Hola, <span className="text-[#8fefdc]"> {user.firstName!}!</span>
      </Title>

      <section>
        <Card className="cardDashboard max-w-[1000px]">
          <CardContent className="mt-5 flex w-full flex-wrap items-center justify-between gap-2">
            <Link href={"sdfksdf"} className="h-auto w-auto">
              <Button className="bg-white text-black shadow-none hover:bg-white">
                <div className="mr-4 box-border rounded-full bg-[#1bdfb7] p-2">
                  <HandCoins className="h-6 w-6" />
                </div>

                <p className="w-[120px] overflow-hidden whitespace-normal text-wrap text-left text-[16px] text-basis">
                  Generacion de Recaudacion
                </p>
              </Button>
            </Link>
            <Link href={"sdfksdf"} className="h-auto w-auto">
              <Button className="bg-white text-black shadow-none hover:bg-white">
                <div className="mr-4 box-border rounded-full bg-[#1bdfb7] p-2">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>

                <p className="w-[120px] overflow-hidden whitespace-normal text-wrap text-left text-[16px] text-basis">
                  Transacciones de la fecha
                </p>
              </Button>
            </Link>
            <Link href={"sdfksdf"} className="h-auto w-auto">
              <Button className="bg-white text-black shadow-none hover:bg-white">
                <div className="mr-4 box-border rounded-full border-none bg-[#1bdfb7] p-2">
                  <LogOut className="h-6 w-6" />
                </div>

                <p className="w-[120px] overflow-hidden whitespace-normal text-wrap text-left text-[16px] text-basis">
                  Informacion de facturacion
                </p>
              </Button>
            </Link>

            <Link href={"sdfksdf"} className="h-auto w-auto">
              <Button className="bg-white text-black shadow-none hover:bg-white">
                <div className="mr-4 box-border rounded-full bg-[#1bdfb7] p-2">
                  <Import className="h-6 w-6" />
                </div>

                <p className="text-wrap text-basis w-[120px] overflow-hidden whitespace-normal text-left text-[16px]">
                  Solicitar transferencia
                </p>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
      <section className="mt-5">
        <h2 className="mb-3 text-xl font-semibold  ">
          Saldo en <span className="text-[#8fefdc]">cuenta</span>
        </h2>{" "}
        <div className="relative inline-flex">
          <Image
            src={"/bitcom_icon.png"}
            alt="icono_bitcom"
            width={50}
            height={50}
            className="absolute right-[-20px] top-[-20px] z-20"
          />

          <Card className="cardDashboard z-0  mt-3 w-[400px] overflow-hidden rounded-[12px]">
            <div className="flex items-center justify-between px-7 pt-7 font-spline-sans">
              <p className="text-4xl font-semibold">
                {" "}
                $<span className="text-3xl"> ****</span>
              </p>
              <div className="box-sizing rounded-full bg-[#1bdfb7] p-2">
                <EyeOff className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 overflow-hidden  bg-[#8fefdc] px-4 py-2">
              <p className="flex items-center gap-1 text-sm font-bold">
                <Clock9 className="h-3 w-3 " /> Actualizado{" "}
                <span className="text-sm font-light opacity-70">
                  {" "}
                  13/05/2024
                </span>
              </p>
            </div>
          </Card>
        </div>
      </section>
      <div className="mt-1 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="cardDashboard col-span-4">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="text-xl">Resumen de cuenta</CardTitle>
              <Select>
                <SelectTrigger className="w-[180px] bg-[#1bdfb7] font-bold">
                  <SelectValue placeholder="Saldo en cuenta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="Pendiente"
                    className="rounded-none border-b border-gray-600"
                  >
                    Pendiente
                  </SelectItem>

                  <SelectItem
                    value="Recaudado"
                    className="rounded-none border-gray-600 border-b"
                  >
                    Recaudado
                  </SelectItem>

                  <SelectItem value="Liquidado">Liquidado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="cardDashboard col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">Transacciones del dia</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
