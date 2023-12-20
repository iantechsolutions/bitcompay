
import AdminSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <AppLayout
      title={<h1>BITCOMPAY</h1>}
      user={session?.user}
      sidenav={<AdminSidenav />}
    >
      <div className="flex justify-center mb-10">
        <Button>Test</Button>
      </div>
      <div>
  
      </div>
    </AppLayout>
  );
}