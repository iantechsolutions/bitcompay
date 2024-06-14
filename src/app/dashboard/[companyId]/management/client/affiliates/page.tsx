import LayoutContainer from "~/components/layout-container";
import { api } from "~/trpc/server";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import { Badge } from "~/components/ui/badge";
import dayjs from "dayjs";
export default async function Home(props: { params: { companyId: string } }) {
  const affiliates = await api.family_groups.list.query();

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Afiliados</Title>
        </div>
        <List>
          {affiliates.map((affiliate) => {
            return (
              <ListTile
                title={affiliate.state}
                subtitle={affiliate.id}
                leading={<Badge>{affiliate.payment_status}</Badge>}
                key={affiliate.id}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
