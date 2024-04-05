import AppSidenav from "~/components/admin-sidenav";
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
      <div className="mb-10 flex justify-center">
        <Button>Opciones</Button>
      </div>
      <div></div>
    </AppLayout>
  );
}
