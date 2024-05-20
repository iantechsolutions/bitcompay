import { Title } from "~/components/title";
import LayoutContainer from "~/components/layout-container";
import { List } from "lucide-react";
import { ListTile } from "~/components/list";



export default async function Page(props: { params: { companyId: string } }) {

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Soporte</Title>
        </div>
       
      </section>
    </LayoutContainer>
  );
}