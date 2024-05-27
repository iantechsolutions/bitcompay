import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";


export default async function Home(props: { params: { companyId: string } }) {
  const documentos = await api.uploads.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Documentos subidos</Title>
        </div>
        <List>
          {documentos.map((documentos) => {
            return (
              <ListTile
                key={documentos.id}
                href={`/dashboard/faIKDivwt7Z8Gp-B5yFrv/maintenance/tables/uploaded_documents/${documentos.id}`}
                title={documentos.id}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
