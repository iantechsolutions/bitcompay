import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { Edit } from "lucide-react";
import EditCompanie from "./edit-information";



export default async function Page(props: { params: { companyId: string } }) {


    const company = await api.companies.get.query({
        companyId: props.params.companyId,
    });


  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
        <Title>Informacion de la compañia</Title>

        <EditCompanie params={{
                companyId: props.params.companyId
                }}/>
        </div>
        {company && <div>

                <Title>{company.name}</Title>
                    <div className="block p-5">
                        <h1 >-CUIT: {company.cuit || "No ingresado"} </h1>
                        <h1> -Clave fiscal:{company.afipKey || "No ingresado"} </h1>
                        <h1> -Razon Social:{company.razon_social || "No ingresado"} </h1>
                    </div>
                </div>      
        }
                </section>
    </LayoutContainer>
  );
}
