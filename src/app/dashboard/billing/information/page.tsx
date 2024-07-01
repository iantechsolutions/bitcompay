import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { Edit } from "lucide-react";
import EditCompany from "./edit-information";

export default async function Page() {
  const company = await api.companies.get.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Informacion de la compañia</Title>
          <EditCompany />
        </div>
        {company && (
          <div>
            <Title>{company.name}</Title>
            <div className="block p-5">
              <h1>-CUIT: {company.cuit || "No ingresado"} </h1>
              <h1> -Clave fiscal:{company.afipKey || "No ingresado"} </h1>
            </div>
          </div>
        )}
      </section>
    </LayoutContainer>
  );
}
