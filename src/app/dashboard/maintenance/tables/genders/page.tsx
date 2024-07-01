import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";

export default async function Home(props: { params: { companyId: string } }) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Generos</Title>
        </div>
      </section>
    </LayoutContainer>
  );
}
