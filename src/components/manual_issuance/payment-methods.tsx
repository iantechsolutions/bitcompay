import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { useState } from "react";
import ElementCard from "../affiliate-page/element-card";
type PaymentMethodsProps = {
  nroCheque: string;
  banco: string;
  emisionDate: Date;
  paymentDate: Date;
  bandera: string;
  cardType: string;
  entity: string;
  transferDate: Date;
};

export default function PaymentMethods() {
  const [paymentMethod, setPaymentMethod] = useState<string>("default");
  const paymentMethodsForm = useForm<PaymentMethodsProps>({});
  const paymentMethodsMap: Record<string, React.ReactNode> = {
    default: <></>,
    efectivo: <></>,
    cheque: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Nº Cheque",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="nroCheque"
                render={({ field }) => <Input type="number" {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
      </>
    ),

    chequeDiferido: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Nº Cheque",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="nroCheque"
                render={({ field }) => <Input type="number" {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="emisionDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
      </>
    ),
    eCheque: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
      </>
    ),
    eCPD: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="emisionDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
      </>
    ),
    tarjeta: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "bandera",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="bandera"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Tipo de tarjeta",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="cardType"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
      </>
    ),
    transferencia: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Entidad",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="entity"
                render={({ field }) => <Input {...field} />}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de transferencia",
            value: (
              <FormField
                control={paymentMethodsForm.control}
                name="transferDate"
                render={({ field }) => <Input type="date" />}
              />
            ),
          }}
        />
      </>
    ),
  };
  return (
    <Form {...paymentMethodsForm}>
      <form>
        <div className="w-full grid grid-flow-col justify-stretch px-4 gap-2 ">
          <ElementCard
            className="pr-1 pb-0 border-[#bef0bb]"
            element={{
              key: "Medio de Pago",
              value: (
                <Select onValueChange={(e) => setPaymentMethod(e)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="chequeDiferido">
                      Cheque pago diferido
                    </SelectItem>
                    <SelectItem value="eCheque"> E-Cheque</SelectItem>
                    <SelectItem value="eCPD">E-CPD</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              ),
            }}
          />
        </div>

        {paymentMethodsMap[paymentMethod]}
      </form>
    </Form>
  );
}
