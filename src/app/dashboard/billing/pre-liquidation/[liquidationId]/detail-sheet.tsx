import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import ContentTable from "./content-table";
import { RouterOutputs } from "~/trpc/shared";

type DetailSheetProps = {
  name: string;
  facturas: RouterOutputs["facturas"]["getByLiquidation"];
};
export default function DetailSheet({ name, facturas }: DetailSheetProps) {
  const summary = {
    "Cuota Planes": 175517.82,
    Bonificación: 175517.82,
    Diferencial: 175517.82,
    Aportes: 175517.82,
    Interés: 175517.82,
  };
  return (
    <Sheet>
      <SheetTrigger>
        {" "}
        <span className="underline text-[#6cebd1] ">{name ?? ""} </span>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[550px] px-10 py-12">
        <SheetHeader>
          <SheetTitle className="font-medium text-2xl">Detalle</SheetTitle>
          <SheetDescription>
            <ul className="ml-3">
              <li className="list-disc">
                {" "}
                <span className="font-bold">Nombre:</span> {name}
              </li>
              <li className="list-disc">
                <span className="font-bold">CUIT:</span>{" "}
              </li>
            </ul>
          </SheetDescription>
        </SheetHeader>
        <div className="bg-[#ecf7f5] flex flex-row justify-evenly gap-0.5 w-full mt-2 py-3">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key}>
              <p className="font-medium text-xs">{key}</p>
              <p className="text-[#4af0d4] font-bold text-sm">$ {value}</p>
            </div>
          ))}
        </div>
        <div className="mt-2">
          {facturas.map((factura) => (
            <ContentTable factura={factura} />
          ))}
        </div>
        <div className="mt-3">
          {Object.entries({
            "Saldo Actual": 87567.23,
            "Saldo post liquidación": 87567.23,
          }).map(([key, value]) => (
            <div className="bg-[#b7f3e8] flex flex-row justify-between px-1.5 py-2 rounded-md mt-2">
              <p className=" text-sm font-semibold opacity-70">{key}: </p>
              <p className="text-[#b5b5b5] text-xs">$ {value}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
