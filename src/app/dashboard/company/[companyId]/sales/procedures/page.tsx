import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import AddProcedure from "./add-procedure";
export default async function Page(props: { params: { companyId: string } }) {
  // cambiar luego por tramite router
  const procedures = await api.bussinessUnits.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Tramites</Title>
          <AddProcedure />
        </div>
        <List>
          {procedures.map((procedure) => (
            <ListTile
              key={procedure.id}
              href={`/dashboard/company/${props.params.companyId}/administration/bussiness_units/${procedure.id}`}
              title={procedure.description}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}