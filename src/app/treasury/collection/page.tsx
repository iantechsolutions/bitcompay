"use client";
import { api } from "~/trpc/react";
import TransactionsPage from "./transactions-page";
import LayoutContainer from "~/components/layout-container";
import { type TableRecord } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useState } from "react";
import dayjs from "dayjs";
import { Title } from "~/components/title";
import { Loader2Icon } from "lucide-react";
export default function Page() {
  try {
    const { data: transactions, isFetching } = api.transactions.list.useQuery();
    let [loading, setLoading] = useState(false);

    const tableData: TableRecord[] = [];

    const { data: possibleBrands } = api.brands.list.useQuery();
    const { data: possibleStatuses } = api.status.list.useQuery();
    const { data: possibleProducts } = api.products.list.useQuery();
    let product;
    let status;
    let brand;

    for (const transaction of transactions ?? []) {
      product = possibleProducts?.find(
        (product) => product.id === transaction?.product
      )?.description;
      status = possibleStatuses?.find(
        (status) => status.id === transaction?.statusId
      )?.description;
      brand = possibleBrands?.find(
        (brand) => brand.number === transaction?.g_c
      )?.name;

      if (transaction) {
        tableData.push({
          name: `${transaction?.name ?? "NO LAST NAME"}`,
          // fiscal_id_number:
          //   transaction?.fiscal_id_number?.toString() ??
          //   "NO ID FISCAL" ??
          //   "NO ID FISCAL",
          // invoice_number: String(transaction?.invoice_number) ?? "NO NUMBER",
          Marca: brand ?? "-",
          Producto: product ?? "-",
          period: dayjs(transaction?.period).format("MM/YYYY"),
          first_due_amount:
            transaction?.first_due_amount?.toFixed(2) ?? "0.00" ?? "NO AMOUNT",
          first_due_date: dayjs(transaction?.first_due_date).format(
            "DD/MM/YYYY"
          ),
          additional_info: transaction?.additional_info ?? "-",
          payment_date: transaction?.payment_date
            ? dayjs(transaction.payment_date).isValid()
              ? dayjs(transaction.payment_date).format("DD/MM/YYYY")
              : "Fecha no válida"
            : "-",
          // collected_amount: transaction?.collected_amount?.toString() ?? "-",
          recollected_amount:
            transaction?.recollected_amount?.toString() ?? "-",
          // comment: "NO COMMENT",
          Estado: status ?? "-",
          // collected_amount: "-"
        });
      }
    }
    const showLoader = loading || isFetching;

    return (
      <LayoutContainer>
        <section className="space-y-2">
          <div className="flex justify-between">
            <div className="flex flex-row">
              <Title>Historial de transacciones</Title>
              {showLoader ? (
                <Loader2Icon className="animate-spin m-1.5 ml-2" size={20} />
              ) : (
                <></>
              )}
            </div>
          </div>
          <DataTable
            columns={columns}
            data={tableData}
            setLoading={setLoading}
          />
        </section>
      </LayoutContainer>
    );
  } catch (error) {
    // const transactions = await api.transactions.list.query();
    // const statusIds = transactions.map((transaction) => transaction.statusId);
    // console.log("statusIds", statusIds.length);
    // console.log("transactions", transactions.length);
    // console.error("Error loading transactions or statuses:", error);
    return <div>No se encontraron cobros</div>;
  }
}

// statusIds.map((statusId) => api.status.get.query({ statusId: statusId! }))
// const statusIds = transactions.map((transaction) => transaction.statusId);
// const statusesList = await api.status.list.query();
// const statuses = await Promise.all(
// const transactionsTable = transactions.map((transaction) => {
//     statusIds.map((statusId) =>
//       statusesList.find((status) => status.id === statusId)
//   )
// );
//   const statusMap = new Map(
//     statuses.map((status) => [status!.id, status!.description])
//   );
//   const description = statusMap.get(transaction.statusId!);
//   if (description) {
//     transaction.statusId = description;
//   }
//   return transaction;
// });
