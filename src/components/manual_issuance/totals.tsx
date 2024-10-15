import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props {
  subTotal: number;
  iva: number;
  otherAttributes: number;
}
const Totals = ({ subTotal, iva, otherAttributes }: Props) => {
  return (
    <div className="border rounded-lg px-4 pt-5 pb-8">
      <p className=" text-lg font-semibold">Totales</p>
      <div className="flex flex-wrap justify-between pb-2 gap-4">
      <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">SUB-TOTAL FACTURA</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`$ ${subTotal}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">IMPORTE IVA</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`$ ${iva}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">OTROS ATRIBUTOS</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`$ ${otherAttributes}`}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[#747474]">TOTAL</Label>
          <div className="bg-[#def5dd] text-[#6952EB] font-semibold rounded-lg w-48 border-[#e9fcf8] border py-1 px-2">
            {`$ ${subTotal - otherAttributes}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Totals;
