import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function Home() {
  // const session = await getServerAuthSession();

  return (
    <>
      <header className="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#204444] pb-[12.5%]">
        <h1 className="text-2xl font-bold text-[#FFD800]">Bitcompay</h1>
      </header>
      <main className="absolute left-0 right-0 top-[50%] z-10 flex justify-center">
        <div className="w-[700px] max-w-full px-10 pb-10">
          <Card className="flex">
            <CardHeader>
              <CardTitle>Aplicación de Bitcompay</CardTitle>
              <CardDescription>Sistema de gestion de pagos</CardDescription>
            </CardHeader>
            <div className="ml-auto mr-8 flex items-center">
              <Link href="/dashboard">
                <Button>Abrir APP</Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
