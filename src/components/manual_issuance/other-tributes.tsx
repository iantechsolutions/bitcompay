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
type OtherTributesForm = {
  tributes: {
    tribute: string;
    base: number;
    aliquot: number;
    amount: number;
  }[];
};
interface Props {
  otherTributes: UseFormReturn<OtherTributesForm>;
}
const OtherTributes = ({ otherTributes }: Props) => {
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
              append({ tribute: "", base: 0, aliquot: 0, amount: 0 })
            }
          >
            Agregar concepto
          </Button>
        </div>
      )}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex justify-stretch items-center w-full mt-3"
        >
          <ElementCard
            element={{
              key: "TRIBUTOS",
              value: (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tributos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tributo 1</SelectItem>
                    <SelectItem value="2">Tributo 2</SelectItem>
                    <SelectItem value="3">Tributo 3</SelectItem>
                  </SelectContent>
                </Select>
              ),
            }}
          />
          <ElementCard
            element={{
              key: "JURISDICCION",
              value: (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar jurisdiccion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Provincias</SelectItem>
                    <SelectItem value="2">Nacion</SelectItem>
                    <SelectItem value="3">Municipio</SelectItem>
                  </SelectContent>
                </Select>
              ),
            }}
          />
          <ElementCard
            element={{
              key: "BASE IMPONIBLE",
              value: <Input type="number" />,
            }}
          />
          <ElementCard
            element={{
              key: "ALICUOTA",
              value: <Input type="number" />,
            }}
          />
          <ElementCard
            element={{
              key: "IMPORTE",
              value: <Input type="number" />,
            }}
          />
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent hover:bg-transparent border-none shadow-none"
            onClick={() =>
              append({ tribute: "", base: 0, aliquot: 0, amount: 0 })
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
      ))}
    </div>
  );
};

export default OtherTributes;
