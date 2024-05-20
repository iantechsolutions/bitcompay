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
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
dayjs.extend(utc);
dayjs.locale("es");
export type InputsGeneralInfo = {
  id: string;
  bussinessUnit: string;
  plan: string;
  validity: string;
  mode: string;
  name: string;
  cuit: string;
  healthInsurances: string;
  employerContribution: string;
  receipt: string;
  bonus: string;
};
export type InputsProcedure = {
  id: string;
};

type GeneralInfoProps = {
  setProspect: (data: InputsGeneralInfo) => void;
  setProcedureId: (data: InputsProcedure) => void;
  form: UseFormReturn<InputsGeneralInfo>;
};

export default function GeneralInfoForm(props: GeneralInfoProps) {
  const [procedureStatus, setProcedureStatus] = useState<string | null>(null);
  const { data: bussinessUnits } = api.bussinessUnits.list.useQuery(undefined);
  const { data: plans } = api.plans.list.useQuery(undefined);
  const { data: modos } = api.modos.list.useQuery(undefined);
  const { mutateAsync: createProcedure } = api.procedure.create.useMutation();
  const { mutateAsync: createProspect, isLoading } =
    api.prospects.create.useMutation();
  const [prospectId, setProspectId] = useState("");

  const onSubmit: SubmitHandler<InputsGeneralInfo> = async (data) => {
    const { setProspect, setProcedureId } = props;
    await createProspect({
      businessUnit: data.bussinessUnit,
      validity: new Date(data.validity),
      plan: data.plan,
      modo: data.mode,
    }).then(async (response) => {
      setProspectId(response[0]!.id);
      setProspect(data);
      if (procedureStatus) {
        const procedure = await createProcedure({
          type: "prospect",
          estado: procedureStatus,
          prospect: response[0]!.id,
        });
        setProcedureId({ id: procedure[0]!.id });
      }
    });
  };

  return (
    <Form {...props.form}>
      <form
        className="space-y-8"
        onSubmit={props.form.handleSubmit(onSubmit)}
        onChange={() => props.setProspect(props.form.getValues())}
      >
        <FormField
          control={props.form.control}
          name="bussinessUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de negocio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una unidad de negocio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bussinessUnits?.map((bussinessUnit) => (
                    <SelectItem key={bussinessUnit.id} value={bussinessUnit.id}>
                      {bussinessUnit.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={props.form.control}
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un Plan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={props.form.control}
          name="validity"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="birth_date">Fecha de vigencia</FormLabel>
              <br />
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
                          dayjs.utc(field.value).format("D [de] MMMM [de] YYYY")
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
                    selected={field.value ? new Date(field.value) : undefined}
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
          control={props.form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un modo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modos?.map((modo) => (
                    <SelectItem key={modo.id} value={modo.id}>
                      {modo.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
