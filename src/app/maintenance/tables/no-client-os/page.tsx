import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import {List, ListTile} from "~/components/list";
import { AddNonClientOs } from "./add-non-client-os";

interface Props {}
export default async function Home(props: Props) {
  const no_client_os = await api.healthInsurances.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Obras sociales no clientes</Title>
          <AddNonClientOs healthInsurance={null}/>
        </div>
        <List>
          {/* {no_client_os.map((no_client_os) => {
            return (
              <ListTile
                key={no_client_os.id}
                leading={no_client_os.name}
                href={`/maintenance/tables/no_client_os/${no_client_os.id}`}
                title={no_client_os.id}
              />
            );
          })} */}
        </List>
      </section>
    </LayoutContainer>
  );
}
