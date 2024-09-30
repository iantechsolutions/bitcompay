"use client";
import { CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { UploadButton } from "~/components/uploadthing";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";
import { OurFileRouter } from "~/app/api/uploadthing/core";
import Image from "next/image";
import { ComboboxDemo } from "~/components/ui/combobox";
export default function BrandPage({
  brand,
  companies,
  relatedCompanies,
}: {
  brand: NonNullable<RouterOutputs["brands"]["get"]>;
  companies: NonNullable<RouterOutputs["companies"]["list"]>;
  relatedCompanies: NonNullable<RouterOutputs["companies"]["getRelated"]>;
}) {
  type CompaniesResponse = NonNullable<RouterOutputs["companies"]["list"]>;
  type Company = CompaniesResponse extends (infer T)[] ? T : never;

  const router = useRouter();
  const [name, setName] = useState(brand.name ?? "");
  const [concept, setConcept] = useState(brand.concept ?? "");
  const [code, setCode] = useState(brand.prisma_code ?? "");
  const [iva, setIva] = useState<string>(brand.iva ?? "");
  const [billType, setBillType] = useState<string>(brand.bill_type ?? "");

  const [description, setDescription] = useState(brand.description ?? "");
  const [reducedDescription, setReducedDescription] = useState(
    brand.redescription
  );
  const [relCompanies, setRelCompanies] = useState(new Set(relatedCompanies));

  const { mutateAsync: changeBrand, isLoading } =
    api.brands.change.useMutation();

  function changeCompany(company: Company, required: boolean) {
    const newRelCompanies = new Set(relCompanies); // Crear una copia del conjunto actual

    console.log(newRelCompanies, company, "Test");

    if (required) {
      newRelCompanies.add(company); // Agregar la empresa al conjunto copiado
    } else {
      for (const relCompany of newRelCompanies) {
        if (relCompany && relCompany.id === company.id) {
          newRelCompanies.delete(relCompany); // Eliminar la empresa del conjunto copiado
          break; // No es necesario continuar después de eliminar el objeto
        }
      }
    }

    setRelCompanies(newRelCompanies); // Establecer la copia actualizada como el nuevo estado
  }

  function validateFields() {
    const errors: string[] = [];
    if (!name) errors.push("Nombre");
    if (!description) errors.push("Descripción");
    if (!reducedDescription) errors.push("Descripción Reducida");
    if (!concept) errors.push("Concepto");
    if (!iva) errors.push("IVA");
    if (!code) errors.push("Código");
    // if (!billType) errors.push("Tipo de Factura");

    return errors;
  }

  async function handleChange() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
      return;
    }
    try {
      const companiesIdArray = Array.from(relCompanies)
        .map((company) => company?.id)
        .filter((companyId): companyId is string => companyId !== undefined);

      const nonNullRelatedCompanies = companiesIdArray.filter(
        (company) => company !== undefined
      );
      const companiesId = new Set(nonNullRelatedCompanies);
      await changeBrand({
        name,
        iva: iva.toString(),
        description,
        billType: billType,
        reducedDescription,
        companiesId,
        code,
        brandId: brand.id,
        concept,
      });
      toast.success("Se han guardado los cambios los");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (brand) {
      setName(brand.name ?? "");
      setIva(brand.iva ?? "");
      setBillType(brand.bill_type ?? "");
    }
  }, [brand]);
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title> {brand.name}</Title>
          <Button disabled={isLoading} onClick={handleChange}>
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckIcon className="mr-2" />
            )}
            Aplicar
          </Button>
        </div>

        <Accordion type="single" collapsible={true} className="w-full">
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <h2 className="text-md">Info. de la marca</h2>
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
                  <div>
                    <Label htmlFor="code">Código de marca(max. 4 carac)</Label>
                    <Input
                      id="code"
                      placeholder="..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      maxLength={4}
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
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción Reducida</Label>
                    <Input
                      id="description"
                      value={reducedDescription}
                      onChange={(e) => setReducedDescription(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="concept">Concepto</Label>
                    <Select
                      onValueChange={(e) => setConcept(e)}
                      value={concept ?? ""}>
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
                  <div className="col-span-2">
                    <Label htmlFor="iva">IVA</Label>
                    <Select value={iva} onValueChange={(e) => setIva(e)}>
                      <SelectTrigger className="w-[180px] font-bold">
                        <SelectValue placeholder="Seleccionar IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">0%</SelectItem>
                        <SelectItem value="9">2.5%</SelectItem>
                        <SelectItem value="8">5%</SelectItem>
                        <SelectItem value="4">10.5%</SelectItem>
                        <SelectItem value="5">21%</SelectItem>
                        <SelectItem value="6">27%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="col-span-2">
                    <Label htmlFor="billtype">Tipo de factura</Label>
                    <div>
                      <ComboboxDemo
                        title="Seleccionar factura..."
                        placeholder="Factura X"
                        value={billType}
                        options={[
                          { value: "FACTURA A", label: "FACTURA A" },
                          { value: "FACTURA B", label: "FACTURA B" },
                          { value: "FACTURA C", label: "FACTURA C" },
                          { value: "FACTURA D", label: "FACTURA M" },
                          { value: "FACTURA E", label: "FACTURA E" },
                        ]}
                        onSelectionChange={(e) => setBillType(e)}
                      />
                    </div>
                  </div> */}
                  <div>
                    <Label> Actualizar Logo Marca</Label>
                    {brand.logo_url && (
                      <div className="mt-2">
                        <Image
                          src={brand.logo_url!}
                          alt="logo marca"
                          width={100}
                          height={100}
                        />
                      </div>
                    )}

                    <UploadButton
                      className="mt-2 flex items-start mx-auto ml-0 ut-button:bg-black ut-button:ml-0"
                      endpoint="brandLogoUpload"
                      input={{ brandId: brand.id }}
                      config={{
                        mode: "manual",
                        appendOnPaste: true,
                      }}
                      content={{
                        button: "Subir logo",
                        allowedContent: "Archivos png/jpg",
                      }}
                      onClientUploadComplete={(res) => {
                        const [file] = res;

                        if (!file) return;
                        toast.success("¡Logo actualizado!");
                      }}
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
                  const isChecked = Array.from(relCompanies).some(
                    (c) => c?.id === company?.id
                  );
                  return (
                    <ListTile
                      key={company?.id}
                      title={company?.name}
                      trailing={
                        <Switch
                          checked={isChecked}
                          onCheckedChange={(required) =>
                            changeCompany(company, required)
                          }
                        />
                      }
                    />
                  );
                })}
              </List>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar Marca</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <Deletebrand brandId={brand.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function Deletebrand(props: { brandId: string }) {
  const { mutateAsync: deletebrand, isLoading } =
    api.brands.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deletebrand({ brandId: props.brandId })
      .then(() => {
        toast.success("Se ha eliminado la marca");
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
        <Button variant="destructive" className="w-[160px]">
          Eliminar Marca
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar la marca?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar marca permanentemente.
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
  );
}
