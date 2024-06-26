import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

import { healthInsurances, modos } from "~/server/db/schema";
import { AddHealthInsurances } from "./AddHealthInsurances";

export default async function Home(props: { params: { companyId: string } }) {
  const obraSocial = await api.healthInsurances.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Obras sociales</Title>
          <AddHealthInsurances />
        </div>
        <List>
          {obraSocial.map((obraSocial) => {
            return (
              <ListTile
                key={obraSocial.id}
                leading={obraSocial.identificationNumber}
                href={`/dashboard/${props.params.companyId}/management/client/health_insurances/${obraSocial.id}`}
                title={obraSocial.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
