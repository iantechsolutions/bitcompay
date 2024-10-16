import { RouterOutputs } from "~/trpc/shared";
import { TableRecord } from "./columns";
import { computeBase, computeIva, toNumberOrZero } from "~/lib/utils";

export function makeExcelRows(
  fgs: RouterOutputs["family_groups"]["getByLiquidationFiltered"],
  excelRowsRef: (string | number)[][] | null,
  tableRowsRef: TableRecord[] | null // por referencia
) {
  fgs.results.forEach((fg) => {
    const excelRow = [];
    const businessUnit = fg?.businessUnitData?.description ?? "";
    const billResponsible = fg?.integrants?.find(
      (integrante) => integrante?.isBillResponsible
    );
    const name = billResponsible?.name ?? "";
    const cuit = billResponsible?.id_number ?? "";
    excelRow.push(fg?.numericalId ?? "");
    excelRow.push(name);
    excelRow.push(cuit);

    const original_comprobante = fg?.comprobantes?.find(
      (comprobante) =>
        comprobante.origin?.toLowerCase() === "factura" &&
        comprobante.tipoComprobante !== "Apertura de CC"
    );

    const last_event = fg.cc?.events.at(0);
    // const saldo_anterior = toNumberOrZero(
    //   original_comprobante?.items.find(
    //     (item) => item.concept === "Factura Anterior"
    //   )?.amount
    // );

    // console.log("Peste", tableRows);
    // const eventPreComprobante = eventos.find(
    //   (x) =>
    //     x.currentAccount_id === fg?.cc?.id &&
    //     x.createdAt < preliquidation?.createdAt
    // );

    /* const saldo_anterior = toNumberOrZero(
      original_comprobante?.items.find(
        (item) => item.concept === "Factura Anterior"
      )?.amount
    ); */

    const saldo_anterior = toNumberOrZero(last_event?.current_amount);

    // excelRow.push(eventPreComprobante?.current_amount ?? 0);

    excelRow.push(saldo_anterior);

    const cuota_planes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Abono")
        ?.amount
    );
    excelRow.push(cuota_planes);
    const bonificacion = toNumberOrZero(
      original_comprobante?.items.find(
        (item) => item.concept === "Bonificación"
      )?.amount
    );
    excelRow.push(bonificacion);

    const diferencial = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Diferencial")
        ?.amount
    );

    excelRow.push(diferencial);

    const Aporte = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Aporte")
        ?.amount
    );
    excelRow.push(Aporte);

    const interes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Interes")
        ?.amount
    );
    excelRow.push(interes);

    const total = toNumberOrZero(
      parseFloat(original_comprobante?.importe?.toFixed(2)!)
    );

    if (excelRowsRef !== null) {
      excelRowsRef.push(excelRow);
    }

    const subTotal = computeBase(
      total,
      Number(original_comprobante?.iva ?? "0")
    );

    const iva = computeIva(total, Number(original_comprobante?.iva ?? "0"));
    excelRow.push(subTotal);
    excelRow.push(iva);
    excelRow.push(total);
    // const lastEvent = await api.events.getLastByDateAndCC.query({
    //   ccId: fg?.cc?.id!,
    //   date: preliquidation?.createdAt ?? new Date(),
    // });
    let currentAccountAmount = -1;
    if (typeof original_comprobante?.importe === "number") {
      currentAccountAmount = saldo_anterior - original_comprobante.importe;
    }

    const plan = fg?.plan?.description ?? "";
    const modo = fg?.modo?.description ?? "";

    if (tableRowsRef !== null) {
      tableRowsRef.push({
        id: fg?.id!,
        nroGF: fg?.numericalId ?? "N/A",
        UN: businessUnit,
        nombre: name,
        cuit,
        "Saldo anterior":
          //  eventPreComprobante?.current_amount ??
          saldo_anterior,
        "cuota plan": cuota_planes,
        bonificacion,
        diferencial: diferencial,
        Aporte,
        interes,
        subtotal: subTotal,
        iva,
        total,
        comprobantes: fg?.comprobantes!,
        currentAccountAmount,
        Plan: plan,
        modo,
      });
    }
  });
}
