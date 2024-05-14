import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";

export default async function Home() {
  const products = await api.products.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Modos</Title>
            
        </div>
        <List>
          
        </List>
      </section>
    </LayoutContainer>
  );
}
