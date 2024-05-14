import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { AddClientDialog } from "./add-client-dialog";
import { api } from "~/trpc/server";

export default async function Home() {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Clientes</Title>
          <AddClientDialog />
        </div>
      </section>
    </LayoutContainer>
  );
}
