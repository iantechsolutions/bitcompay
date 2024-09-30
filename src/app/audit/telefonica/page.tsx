"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";

import LayoutContainer from "~/components/layout-container";

export default async function Page() {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Telefonca</Title>
        </div>
      </section>
    </LayoutContainer>
  );
}
