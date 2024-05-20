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
import GeneralInfoForm, {
  InputsProcedure,
} from "~/components/procedures/general-info-form";

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
  const { mutateAsync: createIntegrant, isLoading } =
    api.integrants.create.useMutation();
  const { mutateAsync: updateProcedure } = api.procedure.change.useMutation();
  const [membersData, setMembersData] = useState<Inputs[]>([]);
  const [billingData, setBillingData] = useState<InputsBilling | null>(null);
  const [procedureData, setProcedureData] = useState<InputsProcedure | null>(
    null,
  );
  const [prospectData, setProspectData] = useState<InputsGeneralInfo | null>(
    null,
  );

  const [currentTab, setCurrentTab] = useState("general_info");
  function handleTabChange(tab: string) {
    setCurrentTab(tab);
  }
  function handlePreLoad() {
    updateProcedure({
      id: procedureData!.id,
      estado: "pendiente",
    });
  }
  function handleFinish() {
    updateProcedure({
      id: procedureData!.id,
      estado: "Completado",
    });
  }

  const handleSumbitMembers = async () => {
    const promises = membersData.map((member) => {
      let status: "single" | "married" | "divorced" | "widowed";
      switch (member.civil_status) {
        case "single":
          status = "single";
          break;
        case "married":
          status = "married";
          break;
        case "divorced":
          status = "divorced";
          break;
        case "widowed":
          status = "widowed";
          break;
        default:
          status = "single";
          break;
      }
      createIntegrant({
        affiliate_type: member.affiliate_type,
        relationship: member.relationship,
        name: member.name,
        id_type: member.id_type,
        id_number: member.id_number,
        birth_date: member.birth_date,
        gender:
          member.gender == "male"
            ? "male"
            : member.gender == "female"
              ? "female"
              : "other",
        civil_status: status,
        nationality: member.nationality,
        afip_status: member.afip_status,
        fiscal_id_type: member.fiscal_id_type,
        fiscal_id_number: member.fiscal_id_number,
        address: member.address,
        phone_number: member.phone_number,
        cellphone_number: member.cellphone_number,
        email: member.mail,
        floor: member.floor,
        department: member.depto,
        lacality: member.localidad,
        partido: member.county,
        state: member.state,
        cp: member.cp,
        zone: member.zone,
        isHolder: member.isHolder,
        isPaymentHolder: member.isPaymentResponsible,
        isAffiliate: member.isAffiliate,
        isBillResponsiblee: member.isBillResponsible,
        iva: member.iva,
        prospect_id: prospectData?.id,
      });
    });
    await Promise.all(promises);
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
            onValueChange={(value) => {
              setCurrentTab(value);
            }}
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
                setProspect={setProspectData}
                setProcedureId={setProcedureData}
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
                  disabled={isLoading}
                >
                  Continuar
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="billing">
              <div>
                <BillingInfo
                  handleFinish={handleFinish}
                  handlePreLoad={handlePreLoad}
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
