"use client";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import GeneralInfoForm from "~/components/procedures/general-info-form";
import { useCompanyData } from "../../company-provider";

export default function AddProcedure() {
  const company = useCompanyData();
  const companyId = company?.id;
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="btn btn-primary">
            <PlusCircle className="mr-2" /> Agregar tramite
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar tramite</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="general_info">
                Informacion General
              </TabsTrigger>
              <TabsTrigger value="members">Integrantes</TabsTrigger>
              <TabsTrigger value="billing">
                Informacion de Facturacion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general_info">
              <GeneralInfoForm />
            </TabsContent>
            <TabsContent value="members">
              // aca va el form de members
            </TabsContent>
            <TabsContent value="billing">
              // aca va el form de facturacion
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// plan de accion:
// poner todo dentro de las tabs
// crear componentes para los forms de cada uno:
// form Datos basicos: de acuerdo al modo se renderizan otras cosas
// tab int: form integrantes dentro de un popup, crear tabla interactiva
// tab facturacion: form facturacion: select productos,
// logica: si dentro de integrantes hay billResponsible o paymanetResponsible, autocompletar y poder editar
