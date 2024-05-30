import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import AddPreLiquidation from "./add-pre-liquidation";

export default async function Page(props: { params: { companyId: string } }) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Pre-Liquidation</Title>
          <AddPreLiquidation companyId={props.params.companyId} />
        </div>
      </section>
    </LayoutContainer>
  );
}
