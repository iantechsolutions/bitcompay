import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import React from "react";


export default async function Home() {

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>services</Title>
        </div>
        <List>
          
        </List>
      </section>
    </LayoutContainer>
  );
}
