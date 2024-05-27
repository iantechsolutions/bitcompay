import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";


export default async function Maintenance(props: { params: { companyId: string } }) {
    const items: string[] = [
        "uploaded_documents",
        "genders",
        "civil_status",
        "parental",
        "modos",
        "health_insurances",
        "market_levels",
        "financial_entities",
        "status",
        "receipt",
        "taxes",
        "items",
        "concepts",
        "bussiness_unit",
        "categories",
        "Nomenclator",
        "state",
        "countries",
        "zone",
        "afip_status",
        "iva",
        "ingresos_brutos",
        "postal_codes"
    ];
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Mantenimiento</Title>
        </div>
        <List>
          {items.map((items) => {
            return (
              <ListTile
                key={items}
                href={`/dashboard/faIKDivwt7Z8Gp-B5yFrv/maintenance/tables/${items}`}

                title={items}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
