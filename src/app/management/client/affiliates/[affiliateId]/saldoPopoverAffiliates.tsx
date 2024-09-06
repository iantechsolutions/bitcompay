import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function SaldoPopoverAffiliates(props: {
  ccId: string | undefined;
  healthInsuranceId: string | undefined;
}) {
  const router = useRouter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-[#F7F7F7] hover:bg-[#F7F7F7] text-[#3E3E3E] text-medium-medium rounded-full shadow-none border-none">
          <Eye className="mr-2" /> Ver movimientos
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="space-y-2">
          <h4 className="font-medium leading-none pb-3">Opciones</h4>
        </div>
        <div className="items-center justify-center">
          <div className=" p-1 w-44">
            <Button className="bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6">
              <Link
                href={`/management/client/affiliates/${props.healthInsuranceId}/cc/${props.ccId}`}
              >
                Consulta de movimientos
              </Link>
            </Button>
          </div>
          <div className=" p-1 w-44">
            <Button
              disabled={true}
              className="pr-8 bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6"
            >
              Simulación de Factura
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
