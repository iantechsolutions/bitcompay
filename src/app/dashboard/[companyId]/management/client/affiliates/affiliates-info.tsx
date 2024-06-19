"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { PlusCircle } from "lucide-react";

interface AffiliatesInfoProps {
    grupoId: string;
}

export function AffiliatesInfo({ grupoId }: AffiliatesInfoProps) {
    
  const { data: grupo } = api.family_groups.get.useQuery({
    family_groupsId: grupoId,
  });

  const { data: cuentasCorrientes } = api.currentAccount.list.useQuery();
  const cc = cuentasCorrientes?.find((cc) => cc.family_group === grupoId);

  const { data: integrant } = api.integrants.getByGroup.useQuery({
    family_group_id: grupoId,
  });

  const { data: facturasList } = api.facturas.list.useQuery();
  
  const test = facturasList?.filter((test) => test.id === "upF5nKuwZRkcl5YMrnqdA")
//   console.log(test)
//   console.log("TEEEEST")
  const facturas = facturasList 
    ? facturasList.filter((factura) => factura.family_group_id === grupoId)
    : [];

  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="p-2" onClick={() => setOpen(true)}>
        <PlusCircle />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="mb-5 mt-5">
            <DialogTitle>Información de los integrantes</DialogTitle>
          </DialogHeader>
          <div>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-center">Nombre</TableHead>
                  <TableHead className="flex-1 text-center">Edad</TableHead>
                  <TableHead className="flex-1 text-center w-[100px]">Genero</TableHead>
                  <TableHead className="flex-1 text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrant ? (
                  integrant.map((integrant) => (
                    <TableRow key={integrant.id} className="flex">
                      <TableCell className="flex-1 font-medium text-center">{integrant.name}</TableCell>
                      <TableCell className="flex-1 text-left">{integrant.age}</TableCell>
                      <TableCell className="flex-1 text-left">{integrant.gender}</TableCell>
                      <TableCell className="flex-1 text-left">{integrant.state}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay afiliados disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <DialogHeader className="mb-5 mt-5">
              <DialogTitle>Cuenta corriente</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-left">Descripcion</TableHead>
                  <TableHead className="flex-1 text-left">Creacion</TableHead>
                  <TableHead className="flex-1 text-left">Tipo</TableHead>
                  <TableHead className="flex-1 text-left w-[100px]">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cc ? (
                  cc.events.map((events) => (
                    <TableRow key={events.id} className="flex">
                      <TableCell className="flex-1 font-medium text-left">{events.description}</TableCell>
                      <TableCell className="flex-1 text-left">{events.createdAt.toString()}</TableCell>
                      <TableCell className="flex-1 text-left">{events.type?.toString()}</TableCell>
                      <TableCell className="flex-1 text-left">{events.current_amount?.toString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay cuenta corriente disponible.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <DialogHeader className="mb-5 mt-5">
              <DialogTitle>Ultimos movimientos</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow className="flex">
                  <TableHead className="flex-1 text-left">Numero</TableHead>
                  <TableHead className="flex-1 text-left w-[100px]">Fecha</TableHead>
                  <TableHead className="flex-1 text-left">IVA</TableHead>
                  <TableHead className="flex-1 text-left">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturas ? (
                  facturas.slice(0, 4).map((factura) => (
                    <TableRow key={factura.id} className="flex">
                        <TableCell className="flex-1 font-medium text-left">N° {factura.nroFactura}</TableCell>
                        <TableCell className="flex-1 text-left">
                        {factura.generated ? new Date(factura.generated).toLocaleDateString() : 'Fecha no disponible'}
                        </TableCell>
                        <TableCell className="flex-1 text-left">{factura.iva}%</TableCell>
                        <TableCell className="flex-1 text-left">{factura.importe}</TableCell>
                        
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay afiliados disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
