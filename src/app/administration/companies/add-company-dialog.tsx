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
  const [afipCondition, setAfipCondition] = useState("");
  const { createOrganization } = useOrganizationList();
  const { mutateAsync: createCompany, isLoading } =
    api.companies.create.useMutation();
  const { mutateAsync: createCC, isLoading: isLoadingCC } =
    api.currentAccount.create.useMutation();
  const { mutateAsync: createEvent, isLoading: isLoadingEvent } =
    api.events.createFirstEvent.useMutation();
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [razon_social, setRazon] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [concept, setConcept] = useState("");
  const [cuit, setCuit] = useState("");
  const [afipKey, setAfipKey] = useState("");
  const [address, setAddress] = useState("");
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
    if (!address) errors.push("Dirección");

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
            razon_social,
            address,
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
        setRazon("");
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
      <Button onClick={() => setOpen(true)} variant="bitcompay" className="text-current text-sm hover:bg-[#BEF0BB]">
        <PlusCircleIcon className="mr-1 h-4" size={20} />
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
            <div className="m-2">
              <Label htmlFor="name" className="m-2">Nombre de la entidad</Label>
              <Input
                id="name"
                placeholder="Ej: Bitcompay"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setOrganizationName(e.target.value);
                }}
                maxLength={50} 
                required
                className="truncate"
              />
            </div>
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
            <div className="m-2">
                <Label htmlFor="razon_social" className="m-2">Razón social</Label>
              <Input
                id="razon_social"
                placeholder="..."
                value={razon_social}
                onChange={(e) => {
                  setRazon(e.target.value);
                }} required
              />
            </div>
            <div className="m-2">
              <Label htmlFor="description" className="m-2">Descripción</Label>
              <Input
                id="description"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="m-2">
              <Label htmlFor="concept" className="m-2">Concepto</Label>
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
                }} required
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
  
            <div className="m-2">
              <Label htmlFor="cuit" className="m-2">CUIL/CUIT</Label>
              <Input
                id="cuit"
                placeholder="00000000000"
                value={cuit}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const numericValue = inputValue.replace(/\D/g, "");
                  setCuit(numericValue);}}
                maxLength={11}
                required
                type="text"
                inputMode="numeric"
                pattern="\d{11}"
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
            <div className="m-2">
              <Label htmlFor="address" className="m-2">Dirección</Label>
              <Input
              id="address"
              placeholder="Ej: Mitre 123, CABA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
               />
          <span className="text-red-600 text-xs">{error}</span>
            </div>

            <div className="m-2" >
              <Label htmlFor="afipKey" className="m-2">Clave fiscal</Label>
              <Input
                id="afipKey"
                placeholder="0"
                value={afipKey}
                onChange={(e) => setAfipKey(e.target.value)}
                required
              />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
            <br />
            <DialogFooter>
              <Button disabled={isLoadingCC || isLoading || !name || !razon_social || !description || !concept || !cuit || !afipKey || !address || !!error} 
              variant="bitcompay"
              className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#c0f8bd]"
              >
                  {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
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
