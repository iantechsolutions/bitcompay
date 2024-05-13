import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import AddUnitDialog from "./add-unit-dialog";
export default async function Page() {
  const units = await api.bussinessUnits.list.query();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Unidades de negocio</Title>
          <AddUnitDialog />
        </div>
        <List>
          {units.map((unit) => (
            <ListTile
              key={unit.id}
              href={`/dashboard/company/${unit.companyId}/administration/bussiness_units/${unit.id}`}
              title={unit.description}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
