
import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <AppLayout
      title={<h1>Configuraciones del sistema</h1>}
      user={session?.user}
      sidenav={<AppSidenav />}
    >
      <div className="flex justify-center mb-10">
        <Button>Opciones</Button>
      </div>
      <div>
  
      </div>
    </AppLayout>
  );
}