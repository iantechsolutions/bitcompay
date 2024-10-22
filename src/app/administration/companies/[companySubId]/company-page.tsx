"use client";

import { af } from "date-fns/locale";
import { CheckIcon, CircleX, Loader2, Loader2Icon, UserCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import { GoBackButton } from "~/components/goback-button";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
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
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { UserList } from "~/lib/types/clerk";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";

interface Brand {
  name: string;
  id: string;
}

type User = {
  id: string;
  name: string;
  email: string;
};

export default function CompanyPage({
  company,
  products,
  brands,
  userList,
}: {
  company: NonNullable<RouterOutputs["companies"]["getById"]>;
  products: RouterOutputs["products"]["list"];
  brands: Brand[] | undefined;
  userList: User[];
}) {
  const [name, setName] = useState(company.name);

  const [afipKey, setAfipKey] = useState(company.afipKey ?? "");
  const [cuit, setCuit] = useState(company.cuit ?? "");
  const [afipCondition, setAfipCondition] = useState(
    company.afip_condition ?? ""
  );
  const [address, setAddress] = useState(company.address ?? "");
  const [razonSocial, setRazonSocial] = useState(company.razon_social ?? "");

  const [description, setDescription] = useState(company.description ?? "");

  const [companyProducts, setCompanyProducts] = useState<Set<string>>(
    new Set(company.products.map((c) => c.productId))
  );

  const { mutateAsync: changeCompany, isLoading } =
    api.companies.change.useMutation();

  async function handleChange() {
    if (!name || !afipCondition || !cuit || !razonSocial || !address) {
      toast.error("Por favor, complete todos los campos obligatorios");
      return;
    }
    try {
      await changeCompany({
        companyId: company.id,
        products: Array.from(companyProducts),
        name,
        description,
        afipKey: afipKey ?? "",
        cuit: cuit ?? "",
        afip_condition: afipCondition ?? "",
        razon_social: razonSocial ?? "",
        address: address ?? "",
      });
      toast.success("Se han guardado los cambios");
    } catch (e) {
      const error = asTRPCError(e)!;
      console.error("Error guardando la entidad:", error);
      toast.error(error.message);
    }
  }

  function changeCompanyChannel(channelId: string, enabled: boolean) {
    const updatedProducts = new Set(companyProducts);
    if (enabled) {
      updatedProducts.add(channelId);
    } else {
      updatedProducts.delete(channelId);
    }
    setCompanyProducts(updatedProducts);
  }

  return (
    <LayoutContainer>
      <GoBackButton url={"/administration/companies"} />
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>{company.name}</Title>
          <Button disabled={isLoading} onClick={handleChange}
          type="submit"
          className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]">
          
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                        ) : (
              <CheckmarkCircle02Icon className="h-5 mr-2"/>
            )}
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
          <AccordionTrigger className="border-b border-b-gray-100 opacity-80 rounded-none">
          <h2 className="text-md text-black">Productos habilitados</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {products?.map((channel) => {
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
              <h2 className="text-md">Info. de la entidad</h2>
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
                      maxLength={50} 
                      className="truncate"
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
                  <div>
                    <Label htmlFor="razonSocial">Razón social</Label>
                    <Input
                      id="razonSocial"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Info. de facturación</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="m-2">
            <Label htmlFor="afipCondition" className="m-2">Condición ante AFIP</Label>
            <select
           id="afipCondition"
             value={afipCondition}
              onChange={(e) => setAfipCondition(e.target.value)}
             className="border-b border-gray-100 opacity-80 rounded-md m-2 w-full
               hover:bg-inherit focus:outline-none focus:border-gray-100 hover:border-gray-100"
            required
                 >
             <option value="">Seleccione una opción</option>
             <option value="Monotributista">Monotributista</option>
             <option value="Responsable Inscripto">Responsable Inscripto</option>
             <option value="Exento">Exento</option>
             <option value="Consumidor Final">Consumidor Final</option>
           </select>
           </div>
                  <div>
                    <Label htmlFor="CUIT">CUIL/CUIT</Label>
                    <Input
                      id="CUIT"
                      value={cuit}
                      onChange={(e) => setCuit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="afipKey">Clave fiscal</Label>
                    <Input
                      id="afipKey"
                      value={afipKey}
                      onChange={(e) => setAfipKey(e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
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
                      href={`/administration/brands/${brand?.id}`}
                      title={brand?.name}
                      key={brand?.id}
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              <h2 className="text-md">Usuarios</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {userList.map((user) => {
                  return (
                    <ListTile
                      leading={<UserCircleIcon />}
                      title={user?.name}
                      key={user?.id}
                      subtitle={user?.email}
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar entidad</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel companySubId={company.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { companySubId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.companies.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ companyId: props.companySubId })
      .then(() => {
        toast.success("Se ha eliminado la entidad correctamente");
        router.push("./");
        router.refresh();
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button className="bg-[#f9c3c3] hover:bg-[#eba2a2] text-[#4B4B4B] text-sm rounded-full py-4 px-4 shadow-none">
        <Delete02Icon className="h-4 w-auto mr-2" />
      Eliminar entidad
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        ¿Está seguro que quiere eliminar la entidad?
      </AlertDialogTitle>
      <AlertDialogDescription>
        Eliminar entidad permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogAction
className="bg-[#f9c3c3] hover:bg-[#eba2a2] text-[#4B4B4B] text-sm rounded-full py-4 px-4 shadow-none"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2Icon className="mr-1 h-4 animate-spin" size={20} />
        ) : (
        <Delete02Icon className="h-4 mr-1" />
      )} Eliminar
      </AlertDialogAction>
      <AlertDialogCancel className=" bg-[#D9D7D8] hover:bg-[#D9D7D8]/80 text-[#4B4B4B] border-0">
          <CircleX className="flex h-4 mr-1" />
            Cancelar</AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

  );
}
