"use client";
import { CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  PaymentInfo,
  type Procedure,
  type paymentInfo,
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
  integrants: Integrant;
  payment_info: PaymentInfo;
}
export default function ProcedurePage(props: ProcedurePageProps) {
  const generalInfoForm = useForm<InputsGeneralInfo>();
  const membersForm = useForm<InputsMembers>();
  const billingForm = useForm<InputsBilling>();

  const [family_groupData, setfamily_groupData] = useState();
  const { mutateAsync: updateProcedure, isLoading } =
    api.procedure.change.useMutation();
  const { mutateAsync: updateFamilyGroup, isLoading: isLoadingFamilyGroup } =
    api.family_groups.change.useMutation();
  const { mutateAsync: updateIntegrants, isLoading: isLoadingIntegrants } =
    api.integrants.change.useMutation();
  const { mutateAsync: paymenteInfo, isLoading: isLoadingPaymentInfo } =
    api.payment_info.change.useMutation();
  const handleChange = async () => {
    try {
      await updateFamilyGroup(props.family_group);
      await updateIntegrants();
      await paymenteInfo();
      await updateProcedure();
      toast.success("tramite actualizado correctamente");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title> {props.procedure.type}</Title>
          <Button disabled={isLoading} onClick={handleChange}>
            {isLoading ? (
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
              <h2 className="text-md">Info. de del tramite</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div>
                  <Tabs>
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
                        setfamily_group={setfamily_groupData}
                        setProcedureId={setProcedureData}
                        form={generalInfoForm}
                      />
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
                        <BillingInfo
                          form={billingForm}
                          setBillingData={setBillingData}
                          data={membersData}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar Marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end"></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

//pregunta desde este pagina se puede ver los tramite precargados o cargados?? onda
// en principio se puede todos los tramits
// pero:
// al guardar los cambios hay un cambio de estado?? a cargado por ej. pero en caso de que ya este cargado, no cambia
// el estado?. Por otra parte, es preferible un acordion o no ?
