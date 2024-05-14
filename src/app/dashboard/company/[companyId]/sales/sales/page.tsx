import { UserRound } from "lucide-react";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { AddSellerDialog } from "./add-seller-dialog";
import { api } from "~/trpc/server";

export default async function Home() {
  const sellers = await api.products.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Vendedores</Title>
          <AddSellerDialog />
        </div>
      </section>
    </LayoutContainer>
  );
}
