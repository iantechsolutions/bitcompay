import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "~/components/ui/select";
import { useForm } from "react-hook-form";
import { Label } from "~/components/ui/label";
type SelectData = {
  cardType: string | null;
  cardBrand: string | null;
  presentationDate: Date | null;
};
type Props = {
  onSelectData: (data: SelectData) => void;
};

export function SelectDebitoAutomatico({ onSelectData }: Props) {
  const [cardType, setCardType] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [presentationDate, setPresentationDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>("");
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(true);
  const form = useForm();

  async function handleGenerate() {
    if (!cardType || !cardBrand) {
      setError("Por favor, complete todos los campos");
      return toast.error("Por favor, complete todos los campos");
    }

    // Llamamos a la función onSelectData y pasamos los valores seleccionados
    onSelectData({
      cardType,
      cardBrand,
      presentationDate: form.getValues("presentation_date"),
    });

    setOpenDialog(false);
  }

  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild={true}></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingresar el tipo de pago a facturar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="card_brand">Marca de Tarjeta</Label>
                <Select onValueChange={(value) => setCardBrand(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marca Tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">MasterCard</SelectItem>
                  </SelectContent>
                </Select>
                <Label htmlFor="card_type">Tipo de Tarjeta</Label>
                <Select onValueChange={(value) => setCardType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo tarjeta" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardBrand === "visa" && (
                      <SelectItem value="debito">Debito</SelectItem>
                    )}
                    <SelectItem value="credito">Credito</SelectItem>
                  </SelectContent>
                </Select>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !presentationDate && "text-muted-foreground"
                      )}>
                      <p>
                        {presentationDate
                          ? dayjs
                              .utc(presentationDate)
                              .format("D [de] MMMM [de] YYYY")
                          : "Escoga una fecha"}
                      </p>
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={presentationDate ?? new Date()}
                      onSelect={(date) => {
                        setPresentationDate(date ?? new Date());
                        setOpen(false);
                      }}
                      disabled={(date: Date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {error && (
                <span className="w-full text-red-600 text-xs">{error}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button type="button" onClick={handleGenerate}>
                buscar archivos
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
