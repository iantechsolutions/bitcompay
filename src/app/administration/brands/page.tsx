import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { AddBrandDialog } from "./add-brand-dialog";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const brands = await api.brands.CompleteList.query();
  const session = getServerAuthSession();

  const orderbrands = brands.sort((a, b) => a.number - b.number);

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Marcas</Title>
          <AddBrandDialog />
        </div>
        <List>
          {orderbrands.map((brand) => {
            return (
              <ListTile
                leading={brand.number}
                key={brand.id}
                href={`/administration/brands/${brand.id}`}
                title={brand.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
