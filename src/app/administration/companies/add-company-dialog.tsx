"use client";

import { CirclePlus, Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, FormEventHandler } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { useOrganizationList } from "@clerk/nextjs";
export function AddCompanyDialog() {
  const { createOrganization } = useOrganizationList();
  const { mutateAsync: createCompany, isLoading } =
    api.companies.create.useMutation();
  const { mutateAsync: createCC, isLoading: isLoadingCC } =
    api.currentAccount.create.useMutation();
  const { mutateAsync: createEvent, isLoading: isLoadingEvent } =
    api.events.createFirstEvent.useMutation();
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [concept, setConcept] = useState("");
  const [cuit, setCuit] = useState("");
  const [afipKey, setAfipKey] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const schema = z.object({
    texto: z.string().max(40),
  });

  function validateFields() {
    const errors: string[] = [];
    if (!description) errors.push("Descripción");
    if (!name) errors.push("Nombre de entidad");
    if (!concept) errors.push("Concepto");
    if (!cuit) errors.push("CUIT/CUIL");
    if (!afipKey) errors.push("Clave fiscal");

    return errors;
  }

  const handleCreate: FormEventHandler<HTMLFormElement> = async (e) => {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    } else {
      e.preventDefault();
      try {
        schema.parse({ texto: concept });
        let organization;
        if (createOrganization) {
          organization = await createOrganization({ name: organizationName });
        } else {
          console.warn("createOrganization is undefined");
        }
        if (organization) {
          await createCompany({
            id: organization.id,
            description,
            name,
            concept,
            cuit,
            afipKey,
          });
          const cc = await createCC({
            company_id: organization.id,
            family_group: null,
          });
          await createEvent({
            ccId: cc[0]?.id ?? "",
            type: "REC",
            amount: 0,
          });
        }
        setName("");
        setDescription("");
        setConcept("");
        toast.success("Entidad creada correctamente");
        router.refresh();
        setOpen(false);
      } catch (e) {
        setError("ocurrio un error al crear entidad");
        const errorResult = asTRPCError(e);
        if (errorResult) {
          toast.error(errorResult.message);
        } else {
          console.error("Error conversion failed");
        }
      }
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear entidad
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva entidad</DialogTitle>
            {/* <DialogDescription>
                    
                </DialogDescription> */}
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div>
              <Label htmlFor="name">Nombre de la entidad</Label>
              <Input
                id="name"
                placeholder="ej: bitcompay"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setOrganizationName(e.target.value);
                }}
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                placeholder="..."
                value={concept}
                onChange={(e) => {
                  setConcept(e.target.value);
                  try {
                    schema.parse({ texto: concept });
                  } catch {
                    setError(
                      "el campo concepto no puede superar los 40 caracteres"
                    );
                  }
                }}
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
            <div>
              <Label htmlFor="cuit">CUIL/CUIT</Label>
              <Input
                id="cuit"
                placeholder="0"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
            <div>
              <Label htmlFor="afipKey">Clave fiscal</Label>
              <Input
                id="afipKey"
                placeholder="0"
                value={afipKey}
                onChange={(e) => setAfipKey(e.target.value)}
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
            <br />
            <DialogFooter>
              <Button disabled={isLoadingCC || isLoading} type="submit">
                {isLoading ? (
                  <Loader2Icon className="mr-2 animate-spin" size={20} />
                ) : (
                  <CirclePlus className="mr-2" />
                )}
                Crear entidad
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
