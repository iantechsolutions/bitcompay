"use client";
import { CheckIcon, Loader2 } from "lucide-react";
import { MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import AppSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { NavUserData } from "~/components/nav-user-section";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { recHeaders } from "~/server/uploads/validators";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

import { useRouter } from "next/navigation";

interface Company {
  name: string;
  id: string;
}

export default function BrandPage({
  brand,
  companies,
  unrelatedCompanies,
}: {
  brand: NonNullable<RouterOutputs["brands"]["get"]>;
  companies: Company[] | undefined | null;
  unrelatedCompanies: NonNullable<RouterOutputs["companies"]["getUnrelated"]>;
}) {
  const [name, setName] = useState(brand.name);
  const [company, setCompany] = useState(brand.companyId);
  const [description, setDescription] = useState(brand.description);
  const [reducedDescription, setReducedDescription] = useState(
    brand.redescription,
  );
  const { mutateAsync: changebrand, isLoading } =
    api.brands.change.useMutation();
  const { mutateAsync: addBrandRelation } = api.brands.change.useMutation();
  async function handleChange() {
    try {
      await changebrand({
        brandId: brand.id,
        name,
        description,
        company,
      });

      toast.success("Se han guardado los cambios");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title> {brand.name}</Title>
          <Button disabled={isLoading} onClick={handleChange}>
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckIcon className="mr-2" />
            )}
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. de la marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción Reducida</Label>
                    <Input
                      id="description"
                      value={reducedDescription}
                      onChange={(e) => setReducedDescription(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Empresas con esta marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {companies?.map((company?) => {
                  return (
                    <ListTile
                      key={company?.id}
                      href={`/dashboard/admin/companies/${company?.id}`}
                      title={company?.name}
                    />
                  );
                })}
              </List>
            </AccordionContent>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <h2 className="text-md">Agregar empresa</h2>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="pm-5 h-20">
                  <Select onValueChange={setCompany}>
                    <SelectTrigger className="w-50">
                      <SelectValue placeholder="Empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {unrelatedCompanies?.map((company?) => {
                        return (
                          <SelectItem key={company?.id} value={company?.id!}>
                            {company?.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <Deletebrand brandId={brand.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function Deletebrand(props: { brandId: string }) {
  const { mutateAsync: deletebrand, isLoading } =
    api.brands.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deletebrand({ brandId: props.brandId })
      .then(() => {
        toast.success("Se ha eliminado la marca");
        router.push("../");
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar canal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la marca?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar marca permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
