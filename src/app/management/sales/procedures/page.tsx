import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  // cambiar luego por tramite router
  const procedures = await api.procedure.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Tramites</Title>
          <Link href={`/management/sales/procedures/add-procedure`}>
            <Button className="btn btn-primary">
              <PlusCircle className="mr-2" /> Agregar tramite
            </Button>
          </Link>
        </div>
        <List>
          {procedures ? (
            procedures.map((procedure) => (
              <ListTile
                key={procedure.id}
                href={`/management/sales/procedures/${procedure.id}`}
                title={<Badge>{procedure.estado}</Badge>}
                leading={procedure.type}
                // subtitle={procedure.id}
              />
            ))
          ) : (
            <h1>No hay tramites disponibles</h1>
          )}
        </List>
      </section>
    </LayoutContainer>
  );
}
