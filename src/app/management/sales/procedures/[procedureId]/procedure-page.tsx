"use client";
import { CheckIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { asTRPCError } from "~/lib/errors";
import { type RouterOutputs } from "~/trpc/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card } from "~/components/ui/card";
import {
  PaymentInfo,
  type Procedure,
  type Integrant,
  type FamilyGroup,
} from "~/server/db/schema";
import { api } from "~/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import GeneralInfoForm from "~/components/procedures/general-info-form";
import AddMembers from "~/components/procedures/members-info";
import MembersTable from "~/components/procedures/member-tab";
import BillingInfo from "~/components/procedures/billing-info";
import { useForm } from "react-hook-form";
import { type InputsGeneralInfo } from "~/components/procedures/general-info-form";
import { type InputsBilling } from "~/components/procedures/billing-info";
import { type InputsMembers } from "~/components/procedures/members-info";

interface ProcedurePageProps {
  procedure: Procedure;
  family_group: FamilyGroup;
  integrants: Integrant[];
  pa: PaymentInfo;
}

export default function ProcedurePage(props: ProcedurePageProps) {
  const [membersData, setMembersData] = useState<InputsMembers[]>([]);
  const initialValuesGeneralInfo: InputsGeneralInfo = {
    name: "",
    healthInsurances: "",
    cuit: "",
    id: props.family_group.id,
    bussinessUnit: props.family_group.businessUnit ?? "",
    plan: props.family_group.plan ?? "",
    validity: props.family_group.validity ?? new Date(),
    mode: props.family_group.modo ?? "",
    receipt: props.family_group.receipt ?? "",
    bonus: props.family_group.bonus ?? "",
  };
  const generalInfoForm = useForm<InputsGeneralInfo>({
    defaultValues: initialValuesGeneralInfo,
  });
  const membersForm = useForm<InputsMembers>();
  const billingForm = useForm<InputsBilling>();

  const { mutateAsync: updateProcedure, isLoading: isLoadingProcedure } =
    api.procedure.change.useMutation();
  const { mutateAsync: updateFamilyGroup, isLoading: isLoadingFamilyGroup } =
    api.family_groups.change.useMutation();
  const { mutateAsync: updateIntegrant, isLoading: isLoadingIntegrants } =
    api.integrants.change.useMutation();
  const { mutateAsync: createIntegrant, isLoading: isCreatingIntegrants } =
    api.integrants.create.useMutation();
  const { mutateAsync: updatePaymentInfo, isLoading: isLoadingPaymentInfo } =
    api.pa.change.useMutation();

  const handleChange = async () => {
    try {
      const generalInfoValues = generalInfoForm.getValues();
      const billingInfoValues = billingForm.getValues();

      await updateFamilyGroup({
        id: props.family_group.id,
        businessUnit: generalInfoValues.bussinessUnit,
        validity: generalInfoValues.validity,
        plan: generalInfoValues.plan,
        modo: generalInfoValues.mode,
        receipt: generalInfoValues.receipt,
        bonus: generalInfoValues.bonus,
        sale_condition: billingInfoValues.sale_condition,
      });

      await updateProcedure({
        id: props.procedure.id,
        type: props.procedure.type ?? "",
        estado: "updated",
      });

      for (const member of membersData) {
        let status: "SOLTERO" | "CASADO" | "DIVORCIADO" | "VIUDO" = "SOLTERO";
        switch (member.civil_status) {
          case "CASADO":
          case "DIVORCIADO":
          case "VIUDO":
            status = member.civil_status;
            break;
          default:
            status = "SOLTERO";
            break;
        }

        let gender: "MASCULINO" | "FEMENINO" | "OTRO" = "OTRO";
        switch (member.gender) {
          case "MASCULINO":
          case "FEMENINO":
            gender = member.gender;
            break;
          default:
            gender = "OTRO";
            break;
        }
        if (member.id) {
          await updateIntegrant({
            id: member.id,
            affiliate_type: member.affiliate_type,
            relationship: member.relationship,
            name: member.name,
            id_type: member.id_type,
            id_number: member.id_number,
            birth_date: member.birth_date,
            gender: gender ?? null,
            civil_status: status,
            extention: member.extention,
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
            localidad: member.localidad,
            partido: member.county,
            provincia: member.province,
            cp: member.cp,
            postal_codeId: member.postal_codeId,
            zona: member.zone,
            isAffiliate: member.isAffiliate,
            iva: member.iva,
            isHolder: member.isHolder,
            isPaymentHolder: member.isPaymentResponsible,
            isBillResponsible: member.isBillResponsible,
            family_group_id: props.family_group.id,
            validity: member.validity ?? undefined,
          });
        } else {
          await createIntegrant({
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
            family_group_id: props.family_group.id,
            isHolder: member.isHolder,
            isPaymentHolder: member.isPaymentResponsible,
            isBillResponsiblee: member.isBillResponsible,
            validity: member.validity ?? new Date(),
          });
        }
      }

      await updatePaymentInfo({
        paymentInfoId: props.pa.id,
        card_number: billingInfoValues.card_number,
        expire_date: billingInfoValues.card_expiration_date ?? null,
        CCV: billingInfoValues.card_security_code,
        CBU: billingInfoValues.cbu,
      });

      toast.success("Tramite actualizado correctamente");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  useEffect(() => {
    setMembersData(
      props.integrants.map((integrant) => {
        let status;
        switch (integrant.civil_status) {
          case "CASADO":
          case "DIVORCIADO":
          case "VIUDO":
            status = integrant.civil_status;
            break;
          default:
            status = "SOLTERO";
            break;
        }

        let gender;
        switch (integrant.gender) {
          case "MASCULINO":
          case "FEMENINO":
            gender = integrant.gender;
            break;
          default:
            gender = "OTRO";
            break;
        }

        return {
          id: integrant.id,
          localidad: integrant.locality ?? "",
          county: integrant.partido ?? "",
          depto: integrant.department ?? "",
          affiliate_type: integrant.affiliate_type ?? "",
          relationship: integrant.relationship ?? "",
          name: integrant.name ?? "",
          id_type: integrant.id_type ?? "",
          id_number: integrant.id_number ?? "",
          birth_date: integrant.birth_date ? integrant.birth_date : new Date(),
          gender: gender,
          civil_status: status,
          nationality: integrant.nationality ?? "",
          afip_status: integrant.afip_status ?? "",
          fiscal_id_type: integrant.fiscal_id_type ?? "",
          fiscal_id_number: integrant.fiscal_id_number ?? "",
          address: integrant.address ?? "",
          address_number: integrant.address_number ?? "",
          phone_number: integrant.phone_number ?? "",
          cellphone_number: integrant.cellphone_number ?? "",
          email: integrant.email ?? "",
          floor: integrant.floor ?? "",
          extention: integrant.extention ?? "",
          department: integrant.department ?? "",
          locality: integrant.locality ?? "",
          partido: integrant.partido ?? "",
          province: integrant.province ?? "",
          cp: integrant.cp ?? "",
          postal_codeId: integrant.postal_codeId ?? "test",
          zone: integrant.zone ?? "",
          isAffiliate: integrant.isAffiliate ?? "",
          iva: integrant.iva ?? "",
          family_group_id: props.family_group.id ?? "",
          isHolder: integrant.isHolder ?? "",
          isBillResponsible: integrant.isBillResponsible ?? "",
          mail: integrant.email ?? "",
          isPaymentResponsible: integrant.isPaymentHolder ?? "",
          validity: integrant.validity,
        };
      })
    );
  }, [props.integrants]);

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title> {props.procedure.type}</Title>
          <Button disabled={isLoadingProcedure} onClick={handleChange}>
            {isLoadingProcedure ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckIcon className="mr-2" />
            )}
            Aplicar cambios
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. del tramite</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div>
                  <Tabs>
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
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar Marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end"></div>
            </AccordionContent>
          </AccordionItem> */}
        </Accordion>
      </section>
    </LayoutContainer>
  );
}
