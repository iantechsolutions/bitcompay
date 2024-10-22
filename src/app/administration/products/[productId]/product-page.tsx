"use client";
import { CheckIcon, Loader2, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import CheckmarkCircle02Icon from "~/components/icons/checkmark-circle-02-stroke-rounded";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";

export default function ProductPage({
  product,
  channels,
  companies,
}: {
  product: NonNullable<RouterOutputs["products"]["get"]>;
  channels: RouterOutputs["channels"]["list"];
  companies: RouterOutputs["companies"]["list"];
}) {
  const router = useRouter();
  const [productChannels, setProductChannels] = useState<Set<string>>(
    new Set(product.channels.map((c) => c.channelId))
  );
  const [productCompanies, setProductCompanies] = useState<Set<string>>(
    new Set(product.company.map((c) => c.companyId))
  );

  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { mutateAsync: deleteProduct, isLoading: isDeleating } =
    api.products.delete.useMutation();

  const { mutateAsync: changeProduct, isLoading } =
    api.products.change.useMutation();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);

  function validateFields() {
    const errors: string[] = [];
    if (!description) errors.push("Descripción");
    if (!name) errors.push("Nombre del producto");

    return errors;
  }
  async function handleChange() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }
    try {
      await changeProduct({
        productId: product.id,
        channels: Array.from(productChannels),
        companies: Array.from(productCompanies),
        name,
        description,
      });
      toast.success("Se han guardado los cambios");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  function changeProductChannel(channelId: string, enabled: boolean) {
    if (enabled) {
      productChannels.add(channelId);
    } else {
      productChannels.delete(channelId);
    }
    setProductChannels(new Set(productChannels));
  }

  function changeProductCompany(companyId: string, enabled: boolean) {
    if (enabled) {
      productCompanies.add(companyId);
    } else {
      productCompanies.delete(companyId);
    }
    setProductCompanies(new Set(productCompanies));
  }

  async function handleDelete() {
    try {
      await deleteProduct({ productId: product.id });

      toast.success("Se ha eliminado el producto");
      router.refresh();
      router.push("../products");
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>{product.name}</Title>
          <Button disabled={isLoading} onClick={handleChange} className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6"
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
              <h2 className="text-md">Canales habilitados</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {channels.map((channel) => (
                  <ListTile
                    key={channel.id}
                    leading={channel.number}
                    title={channel.name}
                    trailing={
                      <Switch
                        checked={productChannels.has(channel.id)}
                        onCheckedChange={(checked) =>
                          changeProductChannel(channel.id, checked)
                        }
                      />
                    }
                  />
                ))}
              </List>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. de la producto</h2>
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
              <h2 className="text-md">Agregar entidad</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {companies?.map((company) => {
                  const isChecked = productCompanies.has(company.id);
                  return (
                    <ListTile
                      key={company?.id}
                      title={company?.name}
                      trailing={
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(required) =>
                            changeProductCompany(company.id, required)
                          }
                        />
                      }
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar producto</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <Button
                  variant={"destructive"}
                  className="ml-10"
                  onClick={() => setOpenDelete(true)}>
                  Eliminar
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro que quiere eliminar el producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Eliminar producto permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 active:bg-red-700 hover:bg-red-600"
              onClick={handleDelete}
              disabled={isLoading}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutContainer>
  );
}
