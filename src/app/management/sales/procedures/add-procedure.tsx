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
  type InputsProcedure,
} from "~/components/procedures/general-info-form";
import { toast } from "sonner";
import AddMembers from "~/components/procedures/members-info";
import MembersTable from "~/components/procedures/member-tab";
import { useState } from "react";
import { api } from "~/trpc/react";
import { type InputsMembers } from "~/components/procedures/members-info";
import BillingInfo from "~/components/procedures/billing-info";
import { type InputsBilling } from "~/components/procedures/billing-info";
import { type InputsGeneralInfo } from "~/components/procedures/general-info-form";
import { useForm } from "react-hook-form";
import { asTRPCError } from "~/lib/errors";

export default function AddProcedure() {
  const { mutateAsync: createIntegrant, isLoading } =
    api.integrants.create.useMutation();
  const { mutateAsync: updateProcedure } = api.procedure.change.useMutation();
  const { mutateAsync: createProcedure } = api.procedure.create.useMutation();
  const { mutateAsync: createfamily_group } =
    api.family_groups.create.useMutation();
  const { mutateAsync: createPaymentInfo } = api.pa.create.useMutation();
  const [membersData, setMembersData] = useState<InputsMembers[]>([]);

  const [activeTab, setActiveTab] = useState("general_info");

  const generalInfoForm = useForm<InputsGeneralInfo>();
  const membersForm = useForm<InputsMembers>();
  const billingForm = useForm<InputsBilling>();

  async function createMembers(
    membersData: InputsMembers[],
    family_groupId?: string
  ) {
    const promises = membersData.map((member) => {
      let status: "SOLTERO" | "CASADO" | "DIVORCIADO" | "VIUDO";
      let gender: "MASCULINO" | "FEMENINO" | "OTRO" = "OTRO";
      switch (member.civil_status) {
        case "SOLTERO":
          status = "SOLTERO";
          break;
        case "CASADO":
          status = "CASADO";
          break;
        case "DIVORCIADO":
          status = "DIVORCIADO";
          break;
        case "VIUDO":
          status = "VIUDO";
          break;
        default:
          status = "SOLTERO";
          break;
      }
      switch (member.gender) {
        case "MASCULINO":
          gender = "MASCULINO";
          break;
        case "FEMENINO":
          gender = "FEMENINO";
          break;
        case "OTRO":
          gender = "OTRO";
          break;
      }
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
      const isAdultHolder =
        member.isHolder && new Date(member.birth_date) <= eighteenYearsAgo;

      console.log(member.postal_codeId);
      return createIntegrant({
        postal_codeId: member.postal_codeId,
        affiliate_type: member.affiliate_type,
        relationship: member.relationship,
        name: member.name,
        id_type: member.id_type,
        id_number: member.id_number,
        birth_date: member.birth_date,
        gender: gender ?? null,
        civil_status: status,
        nationality: member.nationality,
        afip_status: member.afip_status,
        fiscal_id_type: member.fiscal_id_type,
        fiscal_id_number: member.fiscal_id_number,
        address: member.address,
        address_number: member.address_number,
        phone_number: member.phone_number,
        cellphone_number: member.cellphone_number,
        email: member.mail,
        floor: member.floor,
        department: member.depto,
        locality: member.localidad,
        partido: member.county,
        province: member.province,
        cp: member.cp,
        zone: member.zone,
        isAffiliate: member.isAffiliate,
        iva: member.iva,
        family_group_id: family_groupId,
        isHolder: member.isHolder,
        isPaymentHolder: member.isPaymentResponsible ?? isAdultHolder,
        isBillResponsiblee: member.isBillResponsible ?? isAdultHolder,
        validity: member.validity ?? new Date(),
      });
    });

    Promise.all(promises).catch((error) =>
      console.log("An error has occurred", error)
    );
  }
  async function handleload(procedureStatus: string) {
    const valuesForm = generalInfoForm.watch();
    try {
      const result = await createfamily_group({
        businessUnit: valuesForm.bussinessUnit,
        validity: valuesForm.validity,
        plan: valuesForm.plan,
        modo: valuesForm.mode,
        charged_date: new Date(),
        sale_condition: "VENTA",
      });
      const family_groupId = result[0]!.id;

      await createProcedure({
        type: "GFC001",
        estado: procedureStatus,
        family_group: family_groupId,
      });

      await createMembers(membersData, family_groupId);
      const billingFormValues = billingForm.watch();
      await createPaymentInfo({
        card_number: billingFormValues.card_number,
        expire_date: billingFormValues.card_expiration_date ?? null,
        CCV: billingFormValues.card_security_code,
        CBU: billingFormValues.cbu,
        card_type: billingFormValues.card_type ?? null,
        card_brand: billingFormValues.card_brand ?? null,
      });
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

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
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}>
            <TabsList>
              <TabsTrigger value="general_info">
              Información general
              </TabsTrigger>
              <TabsTrigger value="members">Integrantes</TabsTrigger>
              <TabsTrigger value="billing">
                Información de facturación
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general_info">
              <GeneralInfoForm form={generalInfoForm} />
            </TabsContent>
            <TabsContent value="members">
              <div className="flex w-full flex-col gap-2">
                <div className="w-full self-end">
                  <AddMembers
                    addMember={setMembersData}
                    membersData={membersData}
                    form={membersForm}
                  />
                </div>
                <MembersTable data={membersData} />
              </div>
            </TabsContent>
            <TabsContent value="billing">
              <div>
                <BillingInfo form={billingForm} data={membersData} />
              </div>
            </TabsContent>
          </Tabs>
          <section className="flex justify-between">
            <Button onClick={() => handleload("pre cargado")}>
              Pre carga{" "}
            </Button>
            <Button onClick={() => handleload("cargado")}>Cargar</Button>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
