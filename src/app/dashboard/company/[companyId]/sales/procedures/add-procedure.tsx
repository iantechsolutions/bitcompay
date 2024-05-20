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

import AddMembers from "~/components/procedures/members-info";
import MembersTable from "~/components/procedures/member-tab";
import { useState } from "react";
import { type Inputs } from "~/components/procedures/members-info";
import BillingInfo from "~/components/procedures/billing-info";
export default function AddProcedure() {
  const [membersData, setMembersData] = useState<Inputs[]>([]);
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
          <Tabs defaultValue="account">
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
              <div className="flex w-full flex-col gap-2">
                <div className="w-full self-end">
                  <AddMembers
                    addMember={setMembersData}
                    membersData={membersData}
                  />
                </div>

                <MembersTable data={membersData} />
              </div>
            </TabsContent>
            <TabsContent value="billing">
              <div>
                <BillingInfo data={membersData} />
              </div>
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
