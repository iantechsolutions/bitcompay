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
type InputsBilling = {
  product_name: string;
  name: string;
  id_type: string;
  id_number: string;
  fiscal_id_type: string;
  fiscal_id_number: string;
};
type propsBillingInfo = {
  data: Inputs[];
};
export default function BillingInfo({ data }: propsBillingInfo) {
  const isData = data.length > 0;
  const isBillingResponsible =
    isData &&
    data.filter((value) => value.isBillResponsible ?? value.birth_date).length >
      0;

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const isAdult =
    data.filter((value) => new Date(value.birth_date) <= eighteenYearsAgo)
      .length > 0;
  const adult = data.filter(
    (value) => new Date(value.birth_date) <= eighteenYearsAgo,
  )[0];

  const billingResponsible = data.filter((value) => value.isBillResponsible)[0];

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
        ? adult!.fiscal_id_type
        : "",
  };
  const { control, setValue } = useForm<InputsBilling>({
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
  }, [isBillingResponsible, billingResponsible, adult, setValue]);
  const form = useForm({ defaultValues: initialValues });
  //   const products = api.products.list.useQuery();

  //   const productsOptions = products.map((product) => (
  //     <SelectItem value={product.id}>{product.name}</SelectItem>
  //   ));
  const onSubmit: SubmitHandler<InputsBilling> = (data) => {
    console.log(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="product_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="eliga un producto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent></SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fiscal_id_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Id fiscal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Input {...field} placeholder="ingrese su numero de id fiscal" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fiscal_id_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Id </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="fiscal_id_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numero de Id</FormLabel>
              <Input {...field} placeholder="ingrese su numero de id " />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
