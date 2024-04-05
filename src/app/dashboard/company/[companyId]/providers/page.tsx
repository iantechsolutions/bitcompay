import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { AddProviderDialog } from "./add-provider-dialog";
import { api } from "~/trpc/server";

export default async function Home() {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Proveedores</Title>
          <AddProviderDialog />
        </div>
      </section>
    </LayoutContainer>
  );
}
