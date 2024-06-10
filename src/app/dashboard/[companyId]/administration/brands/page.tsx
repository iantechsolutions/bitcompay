import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { AddBrandDialog } from "./add-brand-dialog";

export default async function Home(props: { params: { companyId: string } }) {
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
                leading={brand.number}
                key={brand.id}
                href={`/dashboard/${props.params.companyId}/administration/brands/${brand.id}`}
                title={brand.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
