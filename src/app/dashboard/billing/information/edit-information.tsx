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

export default function EditCompanie(props: { params: { companyId: string } }) {
  const {
    data: company,
    isLoading: isLoadingCompany,
    error: companyError,
  } = api.companies.get.useQuery({
    companyId: props.params.companyId,
  });

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
  const { data: marcas } = api.brands.getbyCompany.useQuery({
    companyId: props.params.companyId,
  });
  const { mutateAsync: Companie, isLoading: isMutating } =
    api.companies.change.useMutation();
  const { mutateAsync: editBrand, isLoading: isMutatingBrand } =
    api.brands.change.useMutation();

  const handleSubmit = async () => {
    try {
      await Companie({
        companyId: props.params.companyId,
        cuit,
        afipKey,
        razon_social,
      });
      setOpen(false); // Close the dialog on success
    } catch (error) {
      setError("error");
    }
  };
  function handleChangeBrand() {
    const brand = marcas?.find((brand) => brand?.id === brandId);
    if (brand) {
      setBrandId(brand.id);
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
            <Select onValueChange={handleChangeBrand}>
              <SelectTrigger className="w-[180px] font-bold">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas &&
                  marcas.map((marca) => (
                    <SelectItem
                      key={marca!.id}
                      value={marca!.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {marca!.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {brandId && (
            <>
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
                <ComboboxDemo
                  title="Seleccionar factura..."
                  placeholder="Factura X"
                  options={[
                    { value: "3", label: "FACTURA A" },
                    { value: "6", label: "FACTURA B" },
                    { value: "11", label: "FACTURA C" },
                    { value: "51", label: "FACTURA M" },
                    { value: "19", label: "FACTURA E" },
                    { value: "8", label: "NOTA DE DEBITO A" },
                    { value: "13", label: "NOTA DE DEBITO B" },
                    { value: "15", label: "NOTA DE DEBITO C" },
                    { value: "52", label: "NOTA DE DEBITO M" },
                    { value: "20", label: "NOTA DE DEBITO E" },
                    { value: "2", label: "NOTA DE CREDITO A" },
                    { value: "12", label: "NOTA DE CREDITO B" },
                    { value: "14", label: "NOTA DE CREDITO C" },
                    { value: "53", label: "NOTA DE CREDITO M" },
                    { value: "21", label: "NOTA DE CREDITO E" },
                  ]}
                  onSelectionChange={(e) => {
                    setTipoFactura(e);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="concepto">Concepto a usar por la marca</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar concepto..."
                  placeholder="Concepto"
                  options={[
                    { value: "1", label: "Productos" },
                    { value: "2", label: "Servicios" },
                    { value: "3", label: "Productos y Servicios" },
                  ]}
                  onSelectionChange={(e) => setConcepto(e)}
                />
              </div>
              <div>
                <Label htmlFor="iva">IVA a usar por la marca</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar una opcion"
                  placeholder="IVA"
                  options={[
                    { value: "3", label: "0%" },
                    { value: "4", label: "10.5%" },
                    { value: "5", label: "21%" },
                    { value: "6", label: "27%" },
                    { value: "8", label: "5%" },
                    { value: "9", label: "2.5%" },
                  ]}
                  onSelectionChange={(e) => setIva(e)}
                />
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
