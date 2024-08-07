"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { ComboboxDemo } from "~/components/ui/combobox";

export default function EditCompany() {
  const {
    data: company,
    isLoading: isLoadingCompany,
    error: companyError,
  } = api.companies.get.useQuery();

  const [cuit, setCuit] = useState("");
  const [afipKey, setAfipKey] = useState("");
  const [razon_social, setRazonSocial] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [tipoFactura, setTipoFactura] = useState<string | null>(null);
  const [concepto, setConcepto] = useState<string | null>(null);
  const [iva, setIva] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setCuit(company.cuit || "");
      setAfipKey(company.afipKey || "");
      setRazonSocial(company.razon_social || "");
    }
  }, [company]);
  const { data: marcas } = api.brands.getbyCurrentCompany.useQuery();
  const { mutateAsync: updateCompany, isLoading: isMutating } =
    api.companies.change.useMutation();
  const { mutateAsync: editBrand, isLoading: isMutatingBrand } =
    api.brands.changeKeepCompany.useMutation();

  const handleSubmit = async () => {
    try {
      const brand = marcas?.find((brand) => brand?.id === brandId);
      const companiesId = await updateCompany({
        companyId: company?.id!,
        cuit,
        afipKey,
        razon_social,
      });
      await editBrand({
        brandId: brandId!,
        razon_social,
        billType: tipoFactura ?? "11",
        concept: concepto ?? "1",
        iva: iva ?? "5",
        name: brand?.name ?? "",
      });
      setOpen(false); // Close the dialog on success
    } catch (error) {
      setError("error");
    }
  };
  function handleChangeBrand(newValue: string) {
    
    setBrandId(newValue);
    
    const brand = marcas?.find((brand) => brand?.id === newValue);
    if (brand) {
      console.log("newValue", newValue);

      console.log(brand);
      console.log(marcas);
      setRazonSocial(brand.razon_social || "");
      setTipoFactura(brand.bill_type || "");
      setConcepto(brand.concept || "");
      setIva(brand.iva || "");
    }
  }

  if (isLoadingCompany) {
    return <div>Loading...</div>;
  }

  if (companyError) {
    return <div>Error loading company data</div>;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" /> Editar datos de la compañia
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingrese los datos</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="cuit">Cuit</Label>
            <Input
              id="cuit"
              placeholder="Enter CUIT"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="afipKey">Clave fiscal</Label>
            <Input
              id="afipKey"
              placeholder="Enter AFIP Key"
              value={afipKey}
              onChange={(e) => setAfipKey(e.target.value)}
            />
          </div>

          <div>
            <Label>Marca</Label>
            <Select onValueChange={(e) => handleChangeBrand(e)}>
              <SelectTrigger className="w-[180px] font-bold">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas &&
                  marcas.map((marca) => (
                    <SelectItem
                      key={marca?.id}
                      value={marca?.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {marca?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {brandId && (
            <>
              <h2>Informacion de marca</h2>
              <div>
                <Label>Razon social en factura de la marca</Label>
                <Input
                  id="razon_social"
                  placeholder="Enter Razon Social"
                  value={razon_social}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="factura">Tipo de factura de la marca</Label>
                <br />
                <Select
                  onValueChange={(e) => setTipoFactura(e)}
                  value={tipoFactura ?? ""}
                >
                  <SelectTrigger className="w-[180px] font-bold">
                    <SelectValue placeholder="Seleccionar factura..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">FACTURA A</SelectItem>
                    <SelectItem value="6">FACTURA B</SelectItem>
                    <SelectItem value="11">FACTURA C</SelectItem>
                    <SelectItem value="51">FACTURA M</SelectItem>
                    <SelectItem value="19">FACTURA E</SelectItem>
                    <SelectItem value="8">NOTA DE DEBITO A</SelectItem>
                    <SelectItem value="13">NOTA DE DEBITO B</SelectItem>
                    <SelectItem value="15">NOTA DE DEBITO C</SelectItem>
                    <SelectItem value="52">NOTA DE DEBITO M</SelectItem>
                    <SelectItem value="20">NOTA DE DEBITO E</SelectItem>
                    <SelectItem value="2">NOTA DE CREDITO A</SelectItem>
                    <SelectItem value="12">NOTA DE CREDITO B</SelectItem>
                    <SelectItem value="14">NOTA DE CREDITO C</SelectItem>
                    <SelectItem value="53">NOTA DE CREDITO M</SelectItem>
                    <SelectItem value="21">NOTA DE CREDITO E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="concepto">Concepto a usar por la marca</Label>
                <br />
                <Select
                  onValueChange={(e) => setConcepto(e)}
                  value={concepto ?? ""}
                >
                  <SelectTrigger className="w-[180px] font-bold">
                    <SelectValue placeholder="Seleccionar concepto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Productos</SelectItem>
                    <SelectItem value="2">Servicios</SelectItem>
                    <SelectItem value="3">Productos y Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="iva">IVA a usar por la marca</Label>
                <br />
                <Select onValueChange={(e) => setIva(e)} value={iva ?? ""}>
                  <SelectTrigger className="w-[180px] font-bold">
                    <SelectValue placeholder="Seleccionar IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">0%</SelectItem>
                    <SelectItem value="4">10.5%</SelectItem>
                    <SelectItem value="5">21%</SelectItem>
                    <SelectItem value="6">27%</SelectItem>
                    <SelectItem value="8">5%</SelectItem>
                    <SelectItem value="9">2.5%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <DialogFooter>
            <Button disabled={isMutating} onClick={handleSubmit}>
              {isMutating && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {error && <div className="error">{error}</div>}
    </>
  );
}
