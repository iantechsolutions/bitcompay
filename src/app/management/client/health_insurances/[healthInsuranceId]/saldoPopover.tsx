import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function SaldoPopover(props: {
  ccId: string | undefined;
  healthInsuranceId: string | undefined;
}) {
  const router = useRouter();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <EllipsisVertical
          className="hover:cursor-pointer"
          width="20px"
          height="20px"
        />
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="space-y-2">
          <h4 className="font-medium leading-none pb-3">Opciones</h4>
        </div>
        <div className="items-center justify-center">
          <div className=" p-1 w-44">
            <Button
              className="bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6"
              onClick={() => {
                if (!props.ccId) {
                  alert("ccId is undefined");
                  return;
                }
                router.push(
                  `/management/client/health_insurances/${props.healthInsuranceId}/cc/${props.ccId}`
                );
              }}
            >
              Consulta de movimientos
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
