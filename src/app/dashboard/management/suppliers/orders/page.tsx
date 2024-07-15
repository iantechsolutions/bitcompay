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
  const { data: test, refetch } = api.brands.list.useQuery();
  const [open, setOpen] = useState(false);
  const { mutateAsync: createtest, isLoading } =
    api.abonos.create.useMutation();

  console.log(test);
  const handleCreateTest = async () => {
    await createtest({
      family_group: "52GFL7OWx_PDTrkf_9lbK",
      valor: 10,
    });
    setOpen(false);
    refetch(); // Refetch data after creation
  };

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
            <Button onClick={handleCreateTest} disabled={isLoading}>
              {isLoading ? "Agregando..." : "Agregar"}
            </Button>
          </DialogContent>
        </Dialog>
        <List>
          {test && test.length > 0 ? (
            test.map((item) => (
              <ListTile
                leading={item.id}
                key={item.id}
                title={item.description || "Sin grupo familiar"}
              />
            ))
          ) : (
            <h1>No hay nada más que esto</h1>
          )}
        </List>
      </section>
    </LayoutContainer>
  );
}
