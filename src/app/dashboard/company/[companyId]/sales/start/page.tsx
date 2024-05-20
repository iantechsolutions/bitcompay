import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";


export default async function Page(props: { params: { companyId: string } }) {
  const facturas = await api.facturas.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Ventas</Title>
        </div>
        <List>
          {facturas.map((facturas) => {
            return (
              <ListTile
                key={facturas.id}
                href={`/dashboard/company/${props.params.companyId}/administration/providers/${facturas.id}`}
                title={facturas.importe}
                leading={<CircleUserRound />}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
