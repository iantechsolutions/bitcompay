import AddCircleIcon from "../icons/add-circle-stroke-rounded";
import CancelCircleIcon from "../icons/cancel-circle-stroke-rounded";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ElementCard from "../affiliate-page/element-card";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { FormField } from "../ui/form";
import { visualizationSwitcher } from "~/lib/utils";
type OtherTributesForm = {
  tributes: {
    tribute: string;
    jurisdiccion: string;
    base: number;
    aliquot: number;
    amount: number;
  }[];
};
interface Props {
  Visualization: boolean;
  otherTributes: UseFormReturn<OtherTributesForm>;
}
const OtherTributes = ({ otherTributes, Visualization }: Props) => {
  const { fields, remove, append } = useFieldArray({
    control: otherTributes.control,
    name: "tributes",
  });
  return (
    <div className="border rounded-lg px-4 pt-5 pb-8 bg-[#F7F7F7]">
      <h1 className="text-lg font-semibold">Otro tributos</h1>
      {fields.length === 0 && (
        <div className="flex justify-between px-2">
          <p> no se agregaran otro tributos</p>
          <Button
            onClick={() =>
              append({
                tribute: "",
                jurisdiccion: "",
                base: 0,
                aliquot: 0,
                amount: 0,
              })
            }
          >
            Agregar concepto
          </Button>
        </div>
      )}
      {fields.map((fieldElement, index) => (
        <div
          key={fieldElement.id}
          className=" w-full grid grid-flow-col gap-5 justify-stretch items-center"
        >
          <ElementCard
            element={{
              key: "TRIBUTOS",
              value: visualizationSwitcher(
                Visualization,
                <FormField
                  name={`tributes.${index}.tribute`}
                  control={otherTributes.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tributos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tributo 1</SelectItem>
                        <SelectItem value="2">Tributo 2</SelectItem>
                        <SelectItem value="3">Tributo 3</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />,
                fieldElement.tribute
              ),
            }}
          />
          <ElementCard
            element={{
              key: "JURISDICCION",
              value: visualizationSwitcher(
                Visualization,
                <FormField
                  name={`tributes.${index}.jurisdiccion`}
                  control={otherTributes.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar jurisdiccion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Provincias</SelectItem>
                        <SelectItem value="2">Nacion</SelectItem>
                        <SelectItem value="3">Municipio</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />,
                fieldElement.base
              ),
            }}
          />
          <ElementCard
            element={{
              key: "BASE IMPONIBLE",
              value: visualizationSwitcher( Visualization,
                <FormField
                  name={`tributes.${index}.base`}
                  control={otherTributes.control}
                  render={({ field }) => <Input type="number" {...field} />}
                />
              , fieldElement.base),
            }}
          />
          <ElementCard
            element={{
              key: "ALICUOTA",
              value: visualizationSwitcher(Visualization,
                <FormField
                  name={`tributes.${index}.aliquot`}
                  control={otherTributes.control}
                  render={({ field }) => <Input type="number" {...field} />}
                />
              , fieldElement.aliquot),
            }}
          />
          <ElementCard
            element={{
              key: "IMPORTE",
              value: visualizationSwitcher(Visualization,
                <FormField
                  name={`tributes.${index}.amount`}
                  control={otherTributes.control}
                  render={({ field }) => <Input type="number" {...field} />}
                />
              , fieldElement.amount),
            }}
          />

          {Visualization ? null : (
            <div className="w-24 flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="bg-transparent hover:bg-transparent border-none shadow-none"
                onClick={() =>
                  append({ tribute: "", jurisdiccion: "",base: 0, aliquot: 0, amount: 0 })
                }
              >
                <AddCircleIcon className="text-[#8bd087]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-transparent hover:bg-transparent border-none shadow-none"
                onClick={() => remove(index)}
              >
                <CancelCircleIcon className="text-[#ed4444]" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OtherTributes;
