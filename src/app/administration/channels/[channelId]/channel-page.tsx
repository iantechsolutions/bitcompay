"use client";
import { CheckIcon, CircleX, Loader2, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
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
// import { type NavUserData } from "~/components/nav-user-section";
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
import { recHeaders } from "~/server/uploads/validators";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";

export default function ChannelPage({
  channel,
}: {
  channel: NonNullable<RouterOutputs["channels"]["get"]>;
}) {
  const [requiredColumns, setRequiredColumns] = useState<Set<string>>(
    new Set(channel.requiredColumns)
  );
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description);
  const [hasChanges, setHasChanges] = useState(false);

  const { refetch } = api.channels.get.useQuery({ channelId: channel.id }, {
    onSuccess(data: any) {
      setName(data.name); 
      setDescription(data.description);
      setRequiredColumns(new Set(data.requiredColumns));
      setHasChanges(false);  
    }
  });

  const { mutateAsync: changeChannel, isLoading } = api.channels.change.useMutation({
    onSuccess: async () => {
      await refetch();  
      toast.success("Se han guardado los cambios");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  function changeRequiredColumn(key: string, required: boolean) {
    const updatedColumns = new Set(requiredColumns);
    if (required) {
      updatedColumns.add(key);
    } else {
      updatedColumns.delete(key);
    }
    setRequiredColumns(updatedColumns);
    setHasChanges(true);  
  }

  function handleInputChange(setter: (value: string) => void, value: string) {
    setter(value);
    setHasChanges(true); 
  }
  async function handleChange() {
    if (!name || !description) {
      toast.error("Por favor, complete todos los campos obligatorios");
      return;
    }
  
    try {
      await changeChannel({
        channelId: channel.id,
        requiredColumns: Array.from(requiredColumns), 
        name,
        description,
      });
    } catch (e) {
      const error = asTRPCError(e)!;
      console.error("Error guardando el canal:", error);
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>
            {channel.number} - {name}
          </Title>
          <Button
            disabled={isLoading || !hasChanges} 
            onClick={handleChange}
            className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6"
          >
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckmarkCircle02Icon className="h-5 mr-2" />
            )}
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Columnas obligatorias</h2>
            </AccordionTrigger>
            <AccordionContent>
            <List>
                {recHeaders.map((header) => (
                  <ListTile
                    key={header.key}
                    title={header.label}
                    subtitle={header.key}
                    trailing={
                      <Switch
                        disabled={header.alwaysRequired}
                        checked={header.alwaysRequired || requiredColumns.has(header.key)}
                        onCheckedChange={(required) => changeRequiredColumn(header.key, required)}
                      />
                    }
                  />
                ))}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. del canal</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleInputChange(setName, e.target.value)}
                      maxLength={20}
                      className="truncate"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => handleInputChange(setDescription, e.target.value)}
                      maxLength={50}
                      className="truncate"
                    />
                  </div>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <h2 className="text-md">Productos con este canal habilitado</h2>
            </AccordionTrigger>
            <AccordionContent>
              <List>
                {channel.products.map(({ product }) => {
                  return (
                    <ListTile
                      key={product.id}
                      href={`/administration/products/${product.id}`}
                      title={product.name}
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar canal</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteChannel channelId={channel.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteChannel(props: { channelId: string }) {
  const { mutateAsync: deleteChannel, isLoading } =
    api.channels.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteChannel({ channelId: props.channelId })
      .then(() => {
        toast.success("Se ha eliminado el canal");
        router.push("./");
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={true}>
        <Button variant="destructive">
          <Delete02Icon className="h-4 mr-1 font-medium place-content-center" />
          Eliminar canal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro que quiere eliminar el canal?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar canal permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-[#f9c3c3] hover:bg-[#f9c3c3]/80 text-[#4B4B4B] text-sm rounded-full py-4 px-4 shadow-none"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
            ) : (
              <Delete02Icon className="h-4 mr-1" />
            )}{" "}
            Eliminar
          </AlertDialogAction>
          <AlertDialogCancel className=" bg-[#D9D7D8] hover:bg-[#D9D7D8]/80 text-[#4B4B4B] border-0">
            <CircleX className="flex h-4 mr-1" />
            Cancelar
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
