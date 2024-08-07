"use client";
import {
  type SubmitHandler,
  useForm,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";
import { type InputsMembers } from "../procedures/members-info";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { error } from "console";
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
  card_expiration_date: Date;
  card_security_code: string;
  cbu: string;
  card_brand: string;
  card_type: string;
};
type propsBillingInfo = {
  data: InputsMembers[];
  form: UseFormReturn<InputsBilling>;
};
export default function BillingInfo({ data, form }: propsBillingInfo) {
  const [apiError, setApiError] = useState(false);
  const isData = data.length > 0;
  const isBillingResponsible =
    isData && data.filter((value) => value.isBillResponsible).length > 0;

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  const isAdult =
    data.filter(
      (value) =>
        new Date(value.birth_date) <= eighteenYearsAgo && value.isHolder
    ).length > 0;
  const adult = data.filter(
    (value) => new Date(value.birth_date) <= eighteenYearsAgo
  )[0];

  const billingResponsible = data.filter((value) => value.isBillResponsible)[0];

  const { setValue } = form;
  useEffect(() => {
    setValue(
      "name",
      isBillingResponsible
        ? billingResponsible!.name
        : isAdult
        ? adult!.name
        : ""
    );
    setValue(
      "id_type",
      isBillingResponsible
        ? billingResponsible!.id_type
        : isAdult
        ? adult!.id_type
        : ""
    );
    setValue(
      "id_number",
      isBillingResponsible
        ? billingResponsible!.id_number
        : isAdult
        ? adult!.id_number
        : ""
    );
    setValue(
      "fiscal_id_type",
      isBillingResponsible
        ? billingResponsible!.fiscal_id_type
        : isAdult
        ? adult!.fiscal_id_type
        : ""
    );
    setValue(
      "fiscal_id_number",
      isBillingResponsible
        ? billingResponsible!.fiscal_id_number
        : isAdult
        ? adult!.fiscal_id_number
        : ""
    );
    setValue(
      "afip_status",
      isBillingResponsible
        ? billingResponsible!.afip_status
        : isAdult
        ? adult!.afip_status
        : ""
    );
  }, [isBillingResponsible, billingResponsible, adult, setValue]);
  const { data: products } = api.products.list.useQuery(undefined);
  const productsOptions = products?.map((product) => (
    <SelectItem value={product.id}>{product.name}</SelectItem>
  ));
  const billingFormValues = form.watch();
  const ApiResponseSchema = z.object({
    Scheme: z.string(),
    Type: z.string(),
  });

  useEffect(() => {
    const validateApiResponse = async () => {
      if (billingFormValues.card_number.length < 6) {
        return;
      }
      try {
        const response = await fetch(
          `https://data.handyapi.com/bin/${billingFormValues.card_number?.slice(
            0,
            8
          )}`
        );
        const data = await response.json();
        const parsedData = ApiResponseSchema.parse(data);
        setApiError(false);
        if (
          parsedData.Scheme.toLowerCase() === "mastercard" &&
          parsedData.Type.toLowerCase() === "debit"
        ) {
          form.setError("card_number", {
            message: "No aceptamos tarjetas MasterCard debito.",
          });
          return;
        }
        form.setValue("card_brand", parsedData.Scheme);
        form.setValue("card_type", parsedData.Type);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Aquí puedes manejar los errores de validación y mostrar un mensaje de error
          form.setError("card_number", {
            message: "La respuesta de la API no es válida.",
          });
          console.log(error);
          setApiError(true);
        } else {
          // Maneja otros errores
          throw error;
        }
      }
    };

    validateApiResponse();
  }, [billingFormValues.card_number]);
  return (
    <>
      <ScrollArea className="h-72">
        <h2 className="text-lg font-semibold">Responsable de facturacion</h2>
        <Form {...form}>
          <form>
            <div className="grid grid-cols-3 gap-x-16 gap-y-6">
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
                          <SelectValue placeholder="elija un producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>{productsOptions}</SelectContent>
                    </Select>
                    {/* {products?.map((product) =>
                  product.channels.map((channel) => (
                    <FormLabel>{channel.channel.name}</FormLabel>
                  )),
                )} */}
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
                          <SelectValue placeholder="elija un tipo de id fiscal " />
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
                          <SelectValue placeholder="elija un tipo de id " />
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado de AFIP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monotributista">
                          Monotributista
                        </SelectItem>
                        <SelectItem value="responsable_inscripto">
                          Responsable Inscripto
                        </SelectItem>
                        <SelectItem value="exento">Exento</SelectItem>
                        <SelectItem value="consumidor_final">
                          Consumidor Final
                        </SelectItem>
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="card_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numero de tarjeta</FormLabel>
                    <Input
                      {...field}
                      placeholder="ingrese su numero de tarjeta"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {apiError && (
                <>
                  <FormField
                    control={form.control}
                    name="card_brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca de Tarjeta</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione marca de tarjeta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">
                              Mastercard
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="card_type"
                    render={({ field, fieldState: { error } }) => (
                      <FormItem>
                        <FormLabel>Tipo de Tarjeta</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="seleccione tipo de tarjeta" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch().card_brand === "visa" ? (
                              <SelectItem value="visa">Debito</SelectItem>
                            ) : null}
                            <SelectItem value="mastercard">Credito</SelectItem>
                          </SelectContent>
                        </Select>
                        {error && <p>{error.message}</p>}
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="card_expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de vencimiento</FormLabel>
                    <br />
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <p>
                              {field.value ? (
                                dayjs
                                  .utc(field.value)
                                  .format("D [de] MMMM [de] YYYY")
                              ) : (
                                <span>Escoga una fecha</span>
                              )}
                            </p>
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="card_security_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codigo de seguridad</FormLabel>
                    <Input
                      {...field}
                      placeholder="ingrese su codigo de seguridad"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cbu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CBU</FormLabel>
                    <Input {...field} placeholder="ingrese su cbu" />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </ScrollArea>
    </>
  );
}
