"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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

export function AddHealthInsurances() {
  const { mutateAsync: createProduct, isLoading } =
    api.healthInsurances.create.useMutation();
  const { mutateAsync: startCC } =
    api.currentAccount.createInitial.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: cps } = api.postal_code.list.useQuery();
  const [description, setDescription] = useState("");
  const [IdNumber, setIdNumber] = useState("");
  const [adress, setAdress] = useState("");
  const [afip_status, setAfip_status] = useState("");
  const [id_number, setId_number] = useState("");
  const [id_type, setId_type] = useState("");
  const [responsible_name, setResponsible_name] = useState("");
  const [locality, setLocality] = useState("");
  const [province, setProvince] = useState("");
  const [postal_code, setPostal_code] = useState("");

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      const healthInsurance = await createProduct({
        name: description,
        identificationNumber: IdNumber,
        isClient: true,
        adress: adress,
        afip_status: afip_status,
        fiscal_id_number: id_number,
        fiscal_id_type: id_type,
        responsibleName: responsible_name,
        locality: locality,
        province: province,
        postal_code: postal_code,
      });
      const currentCompany = await startCC({
        healthInsurance: healthInsurance[0]?.id ?? "",
        company_id: company?.id ?? "",
      });
      toast.success("Obra social creada correctamente");
      queryClient.invalidateQueries();

      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full text-[#3E3E3E] bg-[#C8FF6D] hover:bg-[#C8FF6D]"
      >
        <PlusCircleIcon className="mr-2" size={20} />
        Agregar obra social como cliente
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Agregar obra social</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <Label htmlFor="IdNumber">Numero de Identificacion</Label>
              <Input
                id="IdNumber"
                placeholder="..."
                value={IdNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Nombre</Label>
              <Input
                id="description"
                placeholder="..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="facturationName">Nombre de facturacion</Label>
              <Input
                id="facturationName"
                placeholder="..."
                value={responsible_name}
                onChange={(e) => setResponsible_name(e.target.value)}
              />
            </div>
            <div>
              <Label>Seleccione tipo de documento fiscal</Label>
              <Select
                onValueChange={setId_type}
                defaultValue={id_type}
                // disabled={isBillingResponsible}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo de ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="idNumber">Numero de documento fiscal</Label>
              <Input
                id="idNumber"
                placeholder="..."
                value={id_number}
                onChange={(e) => setId_number(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="adress">Direccion de facturacion</Label>
              <Input
                id="adress"
                placeholder="..."
                value={adress}
                onChange={(e) => setAdress(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="locality">Localidad</Label>
              <Input
                id="locality"
                placeholder="..."
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                placeholder="..."
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Codigo Postal</Label>
              {/* <Input
                id="postal_code"
                placeholder="..."
                value={postal_code}
                onChange={(e) => setPostal_code(e.target.value)}
              /> */}

              <Select
                onValueChange={(e) => setPostal_code(e)}
                value={postal_code}
              >
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccionar CP" />
                </SelectTrigger>
                <SelectContent>
                  {cps?.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.cp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado de AFIP</Label>
              <Select
                onValueChange={setAfip_status}
                defaultValue={afip_status}
                // disabled={isBillingResponsible}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado de AFIP" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monotributista">Monotributista</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable Inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                  <SelectItem value="consumidor_final">
                    Consumidor Final
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
