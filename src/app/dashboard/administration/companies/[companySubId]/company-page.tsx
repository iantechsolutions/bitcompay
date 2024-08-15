"use client";

import { CheckIcon, Loader2, Loader2Icon, UserCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
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
  const [description, setDescription] = useState(company.description);

  const [companyProducts, setCompanyProducts] = useState<Set<string>>(
    new Set(company.products.map((c) => c.productId))
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
                      href={`/dashboard/administration/brands/${brand?.id}`}
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
        toast.success("Se ha eliminado la compañía correctamente");
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
        <Button variant="destructive" className="w-[160px]">
          Eliminar entidad
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la entidad?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar entidad permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}>
            {isLoading && (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
