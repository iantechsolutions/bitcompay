import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";

import { api } from "~/trpc/server";

export default async function Home() {

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Roles</Title>

        </div>
        
      </section>
    </LayoutContainer>
  );
}