"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { cn } from "~/lib/utils";

import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Gender,
  CivilStatus,
  ProviderType,
  IdType,
  ProviderSchema,
  fiscalIdType,
} from "~/server/forms/providers-schema";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { type RouterOutputs } from "~/trpc/shared";
import { useRouter } from "next/navigation";
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  provider_type: string;
  provider_code: string;
  id_type: string;
  id_number: string;
  name: string;
  afip_status: string;
  fiscal_id_type: string;
  fiscal_id_number: string;
  gender: string;
  birth_date: string;
  civil_status: string;
  nationality: string;
  address: string;
  phone_number: string;
  cellphone_number: string;
  email: string;
  financial_entity: string;
  cbu: string;
  status: string;
  unsubscription_motive: string;
};

export default function ProviderForm({
  provider,
  setOpen,
}: {
  provider?: RouterOutputs["providers"]["get"];
  setOpen?: (open: boolean) => void;
}) {
  const initialValues: Inputs = {
    provider_type: provider ? provider.provider_type! : "",
    provider_code: provider?.provider_code
      ? provider.provider_code!.toString()
      : "",
    id_type: provider ? provider.id_type! : "",
    id_number: provider ? provider.id_number!.toString() : "",
    name: provider ? provider.name! : "",
    afip_status: provider ? provider.afip_status! : "",
    fiscal_id_type: provider ? provider.fiscal_id_type! : "",
    fiscal_id_number: provider ? provider.fiscal_id_number!.toString() : "",
    gender: provider ? provider.gender! : "",
    birth_date: provider ? provider.birth_date!.toString() : "",
    civil_status: provider ? provider.civil_status! : "",
    nationality: provider ? provider.nationality! : "",
    address: provider ? provider.address! : "",
    phone_number: provider ? provider.phone_number! : "",
    cellphone_number: provider ? provider.cellphone_number! : "",
    email: provider ? provider.email! : "",
    financial_entity: provider ? provider.financial_entity! : "",
    cbu: provider ? provider.cbu! : "",
    unsubscription_motive: provider?.unsubscription_motive
      ? provider.unsubscription_motive!
      : "",
    status: provider?.status ? provider.status : "",
  };

  const form = useForm<Inputs>({
    resolver: zodResolver(ProviderSchema),
    defaultValues: { ...initialValues },
  });
  const router = useRouter();
  // Define your options for the select inputs
  const genderOptions = Object.entries(Gender).map(([key, value]) => (
    <SelectItem key={key} value={value}>
      {value}
    </SelectItem>
  ));
  const civilStatusOptions = Object.entries(CivilStatus).map(([key, value]) => (
    <SelectItem key={key} value={value}>
      {value}
    </SelectItem>
  ));
  const providerTypeOptions = Object.entries(ProviderType).map(
    ([key, value]) => (
      <SelectItem key={key} value={value}>
        {value}
      </SelectItem>
    ),
  );
  const idTypeOptions = Object.entries(IdType).map(([key, value]) => (
    <SelectItem key={key} value={value}>
      {value}
    </SelectItem>
  ));
  const fiscalIdTypeOptions = Object.entries(fiscalIdType).map(
    ([key, value]) => (
      <SelectItem key={key} value={key}>
        {value}
      </SelectItem>
    ),
  );
  const { mutateAsync: createProvider } = api.providers.create.useMutation();
  const { mutateAsync: updateProvider } = api.providers.change.useMutation();
  const { errors } = form.formState;
  const { watch } = form;
  console.log(errors);
  console.log(JSON.stringify(watch(), null, 2));
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    //aca manda al backend
    try {
      console.log("handleSubmit");
      console.log(data);
      const parsedData = ProviderSchema.parse(data);
      await createProvider(parsedData);
      if (setOpen) {
        setOpen(false);
      }
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };
  const onChange: SubmitHandler<Inputs> = async (data) => {
    //aca manda al backend
    try {
      console.log("handleChange");
      console.log(data);
      const parsedData = ProviderSchema.parse(data);
      await updateProvider({ ...parsedData, id: provider!.id! });
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(provider ? onChange : onSubmit)}
          className="flex-col items-center justify-center gap-2 space-y-8"
        >
          <FormField
            control={form.control}
            name="provider_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="provider_type">Tipo de proveedor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="seleccione un tipo de proveedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{providerTypeOptions}</SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="provider_code">
                  Código de proveedor
                </FormLabel>
                <FormControl>
                  <Input id="provider_code" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="id_type">Tipo de identificación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de identificación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{idTypeOptions}</SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="id_number">
                  Número de identificación
                </FormLabel>
                <FormControl>
                  <Input id="id_number" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nombre</FormLabel>
                <FormControl>
                  <Input id="name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="afip_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="afip_status">Estado AFIP</FormLabel>
                <FormControl>
                  <Input id="afip_status" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_id_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="fiscal_id_type">
                  Tipo de identificación fiscal
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de identificación fiscal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{fiscalIdTypeOptions}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscal_id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="fiscal_id_number">
                  Número de identificación fiscal
                </FormLabel>
                <FormControl>
                  <Input id="fiscal_id_number" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="gender">Género</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un género" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{genderOptions}</SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="birth_date">Fecha de nacimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
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
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date: Date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="civil_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="civil_status">Estado civil</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado civil" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>{civilStatusOptions}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="nationality">Nacionalidad</FormLabel>
                <FormControl>
                  <Input id="nationality" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="address">Dirección</FormLabel>
                <FormControl>
                  <Input id="address" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone">Teléfono</FormLabel>
                <FormControl>
                  <Input id="phone" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cellphone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="cellphone">Celular</FormLabel>
                <FormControl>
                  <Input id="cellphone" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Correo electrónico</FormLabel>
                <FormControl>
                  <Input id="email" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="financial_entity"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="financial_entity">
                  Entidad financiera
                </FormLabel>
                <FormControl>
                  <Input id="financial_entity" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cbu"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="cbu">CBU</FormLabel>
                <FormControl>
                  <Input id="cbu" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {provider && (
            <>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="status">Estado</FormLabel>
                    <FormControl>
                      <Input id="status" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unsubscription_motive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="unsubscription_motive">
                      Motivo de baja
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="unsubscription_motive"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <Button type="submit">
            {provider ? "Actualizar Información" : "Agregar Proveedor"}
          </Button>
        </form>
      </Form>
    </>
  );
}
