import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { AddBrandDialog } from "./add-brand-dialog";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

export default async function Home() {
  const brands = await api.brands.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Marcas</Title>
          <AddBrandDialog />
        </div>
        <List>
          {brands.map((brand) => {
            return (
              <ListTile
                key={brand.id}
                href={`/dashboard/admin/brands/${brand.id}`}
                title={brand.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
