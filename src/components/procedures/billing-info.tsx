"use client";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { api } from "~/trpc/react";
import { Input } from "../ui/input";
import { type Inputs } from "../procedures/members-info";
import { useEffect } from "react";
import { Button } from "../ui/button";
export type InputsBilling = {
  product_name: string;
  name: string;
  id_type: string;
  id_number: string;
  fiscal_id_type: string;
  fiscal_id_number: string;
  address: string;
  iva: string;
  afip_status: string;
  card_number: string;
  card_expiration_date: string;
  card_security_code: string;
};
type propsBillingInfo = {
  data: Inputs[];
  setBillingData: (data: InputsBilling) => void;
};
export default function BillingInfo({
  data,
  setBillingData,
}: propsBillingInfo) {
  const isData = data.length > 0;
  const isBillingResponsible =
    isData && data.filter((value) => value.isBillResponsible).length > 0;

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const isAdult =
    data.filter(
      (value) =>
        new Date(value.birth_date) <= eighteenYearsAgo && value.isHolder,
    ).length > 0;
  const adult = data.filter(
    (value) => new Date(value.birth_date) <= eighteenYearsAgo,
  )[0];

  const billingResponsible = data.filter((value) => value.isBillResponsible)[0];
  console.log(billingResponsible);
  const initialValues: InputsBilling = {
    product_name: "",
    name: isBillingResponsible
      ? billingResponsible!.name
      : isAdult
        ? adult!.name
        : "",
    id_type: isBillingResponsible
      ? billingResponsible!.id_type
      : isAdult
        ? adult!.id_type
        : "",
    id_number: isBillingResponsible
      ? billingResponsible!.id_number
      : isAdult
        ? adult!.id_number
        : "",
    fiscal_id_type: isBillingResponsible
      ? billingResponsible!.fiscal_id_type
      : isAdult
        ? adult!.fiscal_id_type
        : "",
    fiscal_id_number: isBillingResponsible
      ? billingResponsible!.fiscal_id_number
      : isAdult
        ? adult!.fiscal_id_number
        : "",
    address: isBillingResponsible
      ? ` ${billingResponsible!.address} ${
          billingResponsible!.address_number
        } ${billingResponsible!.depto} ${billingResponsible!.floor} ${
          billingResponsible!.county
        } ${billingResponsible!.state} ${billingResponsible!.cp} ${
          billingResponsible!.zone
        }`
      : isAdult
        ? ` ${adult!.address} ${adult!.address_number} ${adult!.depto} ${
            adult!.floor
          } ${adult!.county} ${adult!.state} ${adult!.cp} ${adult!.zone}`
        : "",
    iva: "",
    card_number: "",
    card_expiration_date: "",
    card_security_code: "",
    afip_status: isBillingResponsible
      ? billingResponsible!.afip_status
      : isAdult
        ? adult!.afip_status
        : "",
  };
  const { setValue } = useForm<InputsBilling>({
    defaultValues: initialValues,
  });
  useEffect(() => {
    setValue(
      "name",
      isBillingResponsible
        ? billingResponsible!.name
        : isAdult
          ? adult!.name
          : "",
    );
    setValue(
      "id_type",
      isBillingResponsible
        ? billingResponsible!.id_type
        : isAdult
          ? adult!.id_type
          : "",
    );
    setValue(
      "id_number",
      isBillingResponsible
        ? billingResponsible!.id_number
        : isAdult
          ? adult!.id_number
          : "",
    );
    setValue(
      "fiscal_id_type",
      isBillingResponsible
        ? billingResponsible!.fiscal_id_type
        : isAdult
          ? adult!.fiscal_id_type
          : "",
    );
    setValue(
      "fiscal_id_number",
      isBillingResponsible
        ? billingResponsible!.fiscal_id_number
        : isAdult
          ? adult!.fiscal_id_number
          : "",
    );
    setValue(
      "afip_status",
      isBillingResponsible
        ? billingResponsible!.afip_status
        : isAdult
          ? adult!.afip_status
          : "",
    );
  }, [isBillingResponsible, billingResponsible, adult, setValue]);
  const form = useForm({ defaultValues: initialValues });
  const { data: products } = api.products.list.useQuery(undefined);
  const { mutateAsync: createBillingResponsible } =
    api.billResponsible.create.useMutation();
  const productsOptions = products?.map((product) => (
    <SelectItem value={product.id}>{product.name}</SelectItem>
  ));
  const onSubmit: SubmitHandler<InputsBilling> = async (data) => {
    await createBillingResponsible(data);
    setBillingData(data);
  };
  return (
    <>
      <h2 className="text-lg font-semibold">Responsable de facturacion</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="eliga un producto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{productsOptions}</SelectContent>
                </Select>
                {products?.map((product) =>
                  product.channels.map((channel) => (
                    <FormLabel>{channel.channel.name}</FormLabel>
                  )),
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <Input
                  {...field}
                  placeholder="ingrese su nombre"
                  disabled={isBillingResponsible}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_id_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Id fiscal</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isBillingResponsible}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="eliga un tipo de id fiscal " />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cuit">CUIT</SelectItem>
                    <SelectItem value="cuil">CUIL</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero de Id fiscal</FormLabel>
                <Input
                  {...field}
                  placeholder="ingrese su numero de id fiscal"
                  disabled={isBillingResponsible}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Id </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isBillingResponsible}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="eliga un tipo de id " />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="pasaport">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="afip_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado de AFIP</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isBillingResponsible}
                ></Select>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un estado de AFIP" />
                  </SelectTrigger>
                </FormControl>
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
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero de Id</FormLabel>
                <Input
                  {...field}
                  placeholder="ingrese su numero de id "
                  disabled={isBillingResponsible}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iva"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IVA</FormLabel>
                <Input {...field} placeholder="ingrese su iva" />
              </FormItem>
            )}
          />

          <FormLabel>Campos para DebitoDirecto</FormLabel>

          <Button type="submit">Precarga</Button>
        </form>
      </Form>
    </>
  );
}
