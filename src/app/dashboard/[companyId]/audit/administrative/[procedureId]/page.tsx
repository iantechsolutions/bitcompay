import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { AddAuditDialog } from "./add-audit-dialog";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { procedure } from "~/server/db/schema";

export default async function Page(props: { params: { procedureId: string } }) {
  const procedure = await api.procedure.get.query({
    procedureId: props.params.procedureId,
  });

  return (
    <>
      <LayoutContainer>
        <div />
        <section className="space-y-2">
          <div className="flex justify-between">
            <Title>Auditorias de {procedure?.id}</Title>
            <AddAuditDialog procedure_id={props.params.procedureId} />
          </div>
        </section>
      </LayoutContainer>
    </>
  );
}
