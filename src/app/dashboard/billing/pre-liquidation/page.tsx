"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import AddPreLiquidation from "./add-pre-liquidation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

dayjs.extend(utc);
dayjs.locale("es");

export default function Page() {
  let { data: liquidationsFull } = api.liquidations.list.useQuery();
  //filter liquidations where companyId is equal to the companyId in the URL and estado: "pendiente"
  const { data: possibleBrands } = api.brands.list.useQuery();

  if (liquidationsFull) {
    liquidationsFull = liquidationsFull.filter(
      (liquidation) => liquidation.estado === "pendiente"
    );
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Pre-Liquidation</Title>
          <AddPreLiquidation />
        </div>
        <List>
          {liquidationsFull
            ? liquidationsFull.map((provider) => {
                return (
                  <ListTile
                    key={provider.id}
                    href={`/dashboard/billing/pre-liquidation/${provider.id}`}
                    title={
                      provider.razon_social +
                      " " +
                      dayjs(provider.period).format("MM-YYYY")
                    }
                    leading={<CircleUserRound />}
                  />
                );
              })
            : null}
        </List>
      </section>
    </LayoutContainer>
  );
}
