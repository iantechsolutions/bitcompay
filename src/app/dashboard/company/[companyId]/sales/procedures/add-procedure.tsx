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
import { api } from "~/trpc/react";
import { type Inputs } from "~/components/procedures/members-info";
import BillingInfo from "~/components/procedures/billing-info";
import { type InputsBilling } from "~/components/procedures/billing-info";
import { type InputsGeneralInfo } from "~/components/procedures/general-info-form";
import { SubmitHandler } from "react-hook-form";
export default function AddProcedure() {
  const { mutateAsync: createIntegrant } = api.integrants.create.useMutation();
  const [membersData, setMembersData] = useState<Inputs[]>([]);
  const [billingData, setBillingData] = useState<InputsBilling | null>(null);
  const [generalInfoData, setGeneralInfoData] =
    useState<InputsGeneralInfo | null>(null);
  const [currentTab, setCurrentTab] = useState("general_info");
  function handleTabChange(tab: string) {
    console.log("handleTabChange");
    console.log(currentTab);
    setCurrentTab(tab);
    console.log(currentTab);
  }
  const handleSumbitMembers = async () => {
    const promises = membersData.map((member) => createIntegrant(member));
    await Promise.all(promises);
    console.log("membersData");
    console.log(membersData);
  };

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
          <Tabs
            defaultValue="account"
            // onValueChange={(value) => {
            //   setCurrentTab(value);
            // }}
            value={currentTab}
          >
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
              <GeneralInfoForm
                setGeneralInfo={setGeneralInfoData}
                changeTab={handleTabChange}
              />
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
                <Button
                  onClick={() => {
                    handleSumbitMembers;
                    handleTabChange("billing");
                  }}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="billing">
              <div>
                <BillingInfo
                  setBillingData={setBillingData}
                  data={membersData}
                />
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
