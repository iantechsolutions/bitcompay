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
  <PopoverTrigger asChild className="w-60 whitespace-nowrap">
    <div className="items-center justify-center whitespace-nowrap">
      <div className="p-1 w-44 whitespace-nowrap">
        <Button 
        disabled={!props.ccId}
        className="px-5 bg-[#F7F7F7] hover:bg-[#F7F7F7] text-[#3E3E3E] font-medium text-xs rounded-full border-none flex items-center gap-x-2">
          <Link
            href={`/management/client/affiliates/${props.healthInsuranceId}/cc/${props.ccId}`}
            className="flex items-center"
          >
            <Eye className="mr-0 md:mr-2 w-4 h-4" /> <span className="hidden md:inline">Ver movimientos </span>
          </Link>
        </Button>
      </div>
    </div>
  </PopoverTrigger>
</Popover>
  );
}
