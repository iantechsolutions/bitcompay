import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props {
  subTotal: number;
  iva: number;
  otherAttributes: number;
}
const Totals = ({ subTotal, iva, otherAttributes }: Props) => {
  const formatedSubTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(subTotal);
  const formatedIva = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(iva);
  const formatedOtherAttributes = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(otherAttributes);
  const formatedTotal = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(subTotal - otherAttributes);
  return (
    <div className="border rounded-lg px-4 pt-5 pb-8">
      <p className=" text-lg font-semibold">Totales</p>
      <div className="flex flex-wrap justify-between pb-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">SUB-TOTAL FACTURA</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {` ${formatedSubTotal}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">IMPORTE IVA</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`${formatedIva}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">OTROS ATRIBUTOS</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`${formatedOtherAttributes}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">TOTAL</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {` ${formatedTotal}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totals;
