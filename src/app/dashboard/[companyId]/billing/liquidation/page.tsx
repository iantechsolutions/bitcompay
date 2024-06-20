import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.locale("es");

export default async function Page(props: { params: { companyId: string } }) {
  const liquidationsFull = await api.liquidations.list.query();
  //filter liquidations where companyId is equal to the companyId in the URL and estado: "pendiente"
  const possibleBrands = await api.brands.getbyCompany.query({
    companyId: props.params.companyId,
  });
  const liquidations = liquidationsFull.filter(
    (liquidation) =>
      // possibleBrands.some((brand) => brand?.id === liquidation.brandId) &&
      liquidation.estado === "aprobada"
  );
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Liquidaciones Aprobadas</Title>
        </div>
        <List>
          {liquidations.map((provider) => {
            return (
              <ListTile
                key={provider.id}
                href={`/dashboard/${props.params.companyId}/billing/pre-liquidation/${provider.id}`}
                title={
                  provider.razon_social +
                  " " +
                  dayjs(provider.period).format("MM-YYYY")
                }
                leading={<CircleUserRound />}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
