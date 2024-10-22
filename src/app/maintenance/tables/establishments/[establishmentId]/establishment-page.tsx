"use client";
import { Loader2Icon, CheckIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  SelectItem,
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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

import { asTRPCError } from "~/lib/errors";
import { Establishment } from "~/server/db/schema";
import { api } from "~/trpc/react";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";

type EstablishmentPageProps = {
  establishment: Establishment;
};

export default function EstablishmentPage({
  establishment,
}: EstablishmentPageProps) {
  const router = useRouter();
  const { data: brand } = api.brands.get.useQuery({
    brandId: establishment.brandId,
  });
  const brandName = brand?.name;
  const [establishmentNumber, setEstablishmentNumber] = useState(
    establishment.establishment_number
  );
  const [flag, setFlag] = useState(establishment.flag);
  const flags = [
    { id: "1", name: "visa" },
    { id: "2", name: "mastercard" },
  ];

  const selectFlagOptions = flags?.map((flag) => (
    <SelectItem key={flag.id} value={flag.name}>
      {flag.name}
    </SelectItem>
  ));
  const { mutateAsync: changeEstablishment, isLoading } =
    api.establishments.change.useMutation();
  async function handleUpdate() {
    try {
      await changeEstablishment({
        establishmentId: establishment.id,
        flag: flag,
        establishment_number: establishmentNumber.toString(),
      });
      toast.success("Establecimiento actualizado correctamente");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Editar Establecimiento</Title>
          <Button disabled={isLoading} onClick={handleUpdate} className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6"
          >
             {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckmarkCircle02Icon className="h-5 mr-2"/>
            )}
            Aplicar
          </Button>
        </div>
        <Accordion type="single" collapsible={true} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2>Info. del establecimiento</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="establishment_number">
                      Nro. de Establecimiento
                    </Label>
                    <Input
                      id="name"
                      value={establishmentNumber}
                      onChange={(e) =>
                        setEstablishmentNumber(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="flag">Bandera</Label>
                    <Select
                      defaultValue={flag}
                      onValueChange={(value) => setFlag(value)}>
                      <SelectTrigger>
                        <SelectValue>{flag}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>{selectFlagOptions}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="brand"> Marca</Label>
                    <Select defaultValue={brandName} disabled>
                      <SelectTrigger>
                        <SelectValue>{brandName}</SelectValue>
                      </SelectTrigger>
                    </Select>
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2>Eliminar Establecimiento</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <DeleteEstablishment establishmentId={establishment.id} />
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteEstablishment(props: { establishmentId: string }) {
  const { mutateAsync: deleteEstablishment, isLoading } =
    api.establishments.delete.useMutation();
  const router = useRouter();
  const handleDelete: MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    try {
      await deleteEstablishment({ establishmentId: props.establishmentId });
      toast.success("Se ha eliminado el establecimiento");
      router.push("./");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={true}>
        <Button variant="destructive">Eliminar Establecimiento</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro que quiere eliminar el establecimiento?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar establecimiento permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            className="bg-red-500 active:bg-red-700 hover:bg-red-600"
            onClick={handleDelete}
            disabled={isLoading}>
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
