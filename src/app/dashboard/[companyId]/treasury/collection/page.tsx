import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";


export default async function Page(props: { params: { companyId: string } }) {
 
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Recollecion</Title>
        </div>
        
      </section>
    </LayoutContainer>
  );
}
