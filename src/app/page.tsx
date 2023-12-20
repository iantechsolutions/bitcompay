import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default async function Home() {
  // const session = await getServerAuthSession();

  return <>
    <header className="flex items-center justify-center bg-[#204444] fixed top-0 left-0 right-0 bottom-0 pb-[12.5%]">
      <h1 className="font-bold text-2xl text-[#FFD800]">Bitcompay</h1>
    </header>
    <main className="z-10 absolute top-[50%] left-0 right-0 flex justify-center">
      <div className="w-[700px] max-w-full px-10 pb-10">
        <Card className="flex">
          <CardHeader>
            <CardTitle>Aplicación de Bitcompay</CardTitle>
            <CardDescription>Sistema de gestion de pagos</CardDescription>
          </CardHeader>
          <div className="flex items-center ml-auto mr-8">
            <Link href="/dashboard">
              <Button>Abrir APP</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  </>
}