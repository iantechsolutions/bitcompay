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
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

interface Brand {
  name: string;
  id: string;
}

export default function CompanyPage({
  company,
  user,
  products,
  brands,
}: {
  company: NonNullable<RouterOutputs["companies"]["get"]>;
  user: NavUserData;
  products: RouterOutputs["products"]["list"];
  brands: Brand[] | undefined;
}) {
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description);

  const [companyProducts, setCompanyProducts] = useState<Set<string>>(
    new Set(company.products.map((c) => c.productId)),
  );

  const { mutateAsync: changeCompany, isLoading } =
    api.companies.change.useMutation();

  async function handleChange() {
    try {
      await changeCompany({
        companyId: company.id,
        products: Array.from(companyProducts),
        name,
        description,
      });
      toast.success("Se han guardado los cambios");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  function changeCompanyChannel(channelId: string, enabled: boolean) {
    if (enabled) {
      companyProducts.add(channelId);
    } else {
      companyProducts.delete(channelId);
    }
    setCompanyProducts(new Set(companyProducts));
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>{company.name}</Title>
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
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Productos habilitados</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {products.map((channel) => {
                  return (
                    <ListTile
                      key={channel.id}
                      leading={channel.number}
                      title={channel.name}
                      trailing={
                        <Switch
                          checked={companyProducts.has(channel.id)}
                          onCheckedChange={(checked) =>
                            changeCompanyChannel(channel.id, checked)
                          }
                        />
                      }
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. de la empresa</h2>
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
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Info de facturacion</h2>
            </AccordionTrigger>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
              <h2 className="text-md">Marcas</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {brands?.map((brand) => {
                  return (
                    <ListTile
                      href={`/dashboard/${company.id}/administration/brands/${brand.id}`}
                      title={brand.name}
                      key={brand.id}
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar empresa</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel companyId={company.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { companyId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.companies.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ companyId: props.companyId })
      .then(() => {
        toast.success("Se ha eliminado el canal");
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
          Eliminar empresa
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la empresa?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar empresa permanentemente.
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
