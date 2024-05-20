"use client";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "../ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import MembersTable from "./member-tab";
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "~/lib/utils";
import { add } from "date-fns";
dayjs.extend(utc);
dayjs.locale("es");

export type InputsMembers = {
  iva: string;
  affiliate_type: string;
  relationship: string;
  name: string;
  id_type: string;
  id_number: string;
  birth_date: string;
  gender: string;
  civil_status: string;
  nationality: string;
  afip_status: string;
  fiscal_id_type: string;
  fiscal_id_number: string;
  address: string;
  address_number: string;
  floor: string;
  depto: string;
  localidad: string;
  county: string;
  state: string;
  cp: string;
  zone: string;
  phone_number: string;
  cellphone_number: string;
  mail: string;
  isHolder: boolean;
  isBillResponsible: boolean;
  isPaymentResponsible: boolean;
  isAffiliate: boolean;
};

interface AddMembersProps {
  membersData: InputsMembers[];
  form: UseFormReturn<InputsMembers>;
  addMember: (data: InputsMembers[]) => void;
}

export default function AddMembers(props: AddMembersProps) {
  const [open, setOpen] = useState(false);
  const onSubmit: SubmitHandler<InputsMembers> = async (data) => {
    const { addMember, membersData } = props;
    addMember([...membersData, data]);
    console.log("dataMembersForm");
    console.log(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-2">
          Agregar miembro
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[500px] min-w-[1200px] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Agregar miembro</DialogTitle>
          <DialogDescription>
            Agregue un miembro aqui, especifique si es titular, responsable de
            pago, responsable de facturación o afiliado.
          </DialogDescription>
        </DialogHeader>
        <Form {...props.form}>
          <form
            onSubmit={props.form.handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-2"
          >
            <div className="grid grid-cols-4 gap-x-16 gap-y-6">
              <FormField
                control={props.form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parentezco</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un parentezco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Holder">Titular</SelectItem>
                        <SelectItem value="child">Hijo/a</SelectItem>
                        <SelectItem value="parent">Padre/Madre</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido y Nombre</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ingrese el apellido y nombre"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="id_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Documento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de documento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nro. de Documento</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ingrese el número de documento"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
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
                control={props.form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female>">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="civil_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado civil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Soltero/a</SelectItem>
                        <SelectItem value="married">Casado/a</SelectItem>
                        <SelectItem value="divorced">Divorciado/a</SelectItem>
                        <SelectItem value="widowed">Viudo/a</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidad</FormLabel>
                    <Input {...field} placeholder="Ingrese la nacionalidad" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="afip_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición Impositiva</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una condición impositiva" />
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
                control={props.form.control}
                name="fiscal_id_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de id fiscal</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de id fiscal" />
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
                control={props.form.control}
                name="fiscal_id_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nro. de Id fiscal</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ingrese el número de id fiscal"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domicilio</FormLabel>
                    <Input {...field} placeholder="Ingrese el domicilio" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="address_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nro. de Domicilio</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ingrese el número de domicilio"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Piso</FormLabel>
                    <Input {...field} placeholder="Ingrese el piso" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="depto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depto.</FormLabel>
                    <Input {...field} placeholder="Ingrese el departamento" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="localidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <Input {...field} placeholder="Ingrese la localidad" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partido</FormLabel>
                    <Input {...field} placeholder="Ingrese el partido" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <Input {...field} placeholder="Ingrese la provincia" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="cp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <Input {...field} placeholder="Ingrese el código postal" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <Input {...field} placeholder="Ingrese la zona" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Particular</FormLabel>
                    <Input
                      {...field}
                      placeholder="Ingrese el teléfono particular"
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="cellphone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Móvil</FormLabel>
                    <Input {...field} placeholder="Ingrese el teléfono móvil" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="mail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} placeholder="Ingrese el email" />
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="mail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} placeholder="Ingrese el email" />
                  </FormItem>
                )}
              />

              <FormField
                control={props.form.control}
                name="iva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccione el iva a utilizar</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tipo de iva" />
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
                control={props.form.control}
                name="isHolder"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Es Titular?</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="isBillResponsible"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Es Responsable de Facturación?</FormLabel>
                    </div>{" "}
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="isPaymentResponsible"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Es Responsable de Pago?</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={props.form.control}
                name="isAffiliate"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Es Afiliado?</FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-[150px] self-end">
              Agregar Miembro
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
