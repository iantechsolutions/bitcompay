import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import AddProcedure from "./add-procedure";
export default async function Page(props: { params: { companyId: string } }) {
  // cambiar luego por tramite router
  const procedures = await api.procedure.list.query();
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
              href={`/dashboard/${props.params.companyId}/management/sales/${procedure.id}`}
              title={procedure.estado}
            />
          ))}
        </List>
      </section>
    </LayoutContainer>
  );
}
