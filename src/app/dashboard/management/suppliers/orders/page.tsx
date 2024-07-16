"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createtest, isLoading } =
    api.abonos.create.useMutation();

  const {
    data: dev,
    isLoading: isLoadingDev,
    error: errorDev,
  } = api.comprobantes.getByLiquidation.useQuery({
    liquidationId: "5gAc2nDtFeYwz4yIMCopz",
  });

  if (dev && dev != undefined) {
    console.log(dev);
    console.log("-----------------------------------------------");
  }

  if (isLoadingDev) {
    return <div>Cargando...</div>;
  }

  if (errorDev) {
    return <div>Error al cargar los datos</div>;
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <Title>brands</Title>
          <Button onClick={() => setOpen(true)}>Agregar</Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear un test</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        {/* <List>
          {dev ? (
            dev.map((item) => (
              <div>
                <ListTile
                  leading={item.liquidations?.estado}
                  key={item.id}
                  title={
                    item.liquidations?.razon_social! || "Sin grupo familiar"
                  }
                />
                <h1>{item.due_date?.getDate()}</h1>
                <h1>{item.id}</h1>
              </div>
            ))
          ) : (
            <h1>No hay nada más que esto</h1>
          )}
        </List> */}
      </section>
    </LayoutContainer>
  );
}
