"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import BarcodeProcedure from "~/components/barcode";

export default function Page() {
  const { data: payment, isLoading } = api.transactions.list.useQuery();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  const pago = payment?.find((x) => x.id === "hwcIMPTwA5UN6uqZY5UgG");

  if (!pago) {
    return <div>No se encontró el pago.</div>;
  }

  let barcodeImage;

  // barcodeImage = BarcodeProcedure({
  //   dateVto: pago.first_due_date ?? new Date(),
  //   amountVto: pago.first_due_amount ?? 0,
  //   client: pago.fiscal_id_number ?? 0,
  //   isPagoFacil: true,
  //   invoiceNumber: pago.invoice_number ?? 0,
  // });

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Pagos</Title>
        </div>

        <BarcodeProcedure
          dateVto={pago.first_due_date ?? new Date()}
          amountVto={pago.first_due_amount ?? 0}
          client={pago.fiscal_id_number ?? 0}
          isPagoFacil={true}
          invoiceNumber={pago.invoice_number ?? 0}
        />
      </section>
    </LayoutContainer>
  );
}
