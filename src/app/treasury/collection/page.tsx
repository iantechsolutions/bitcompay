import { api } from "~/trpc/server";
import TransactionsPage from "./transactions-page";
import LayoutContainer from "~/components/layout-container";

export default async function Page() {
  try {
    const transactions = await api.transactions.list.query();
    console.log("AAAAAAAAAAAAAAAAAAAAAAAA");
    const statusIds = transactions.map((transaction) => transaction.statusId);
    const statusesList = await api.status.list.query();
    const statuses = await Promise.all(
      // statusIds.map((statusId) => api.status.get.query({ statusId: statusId! }))
      statusIds.map((statusId) =>
        statusesList.find((status) => status.id === statusId)
      )
    );

    const statusMap = new Map(
      statuses.map((status) => [status!.id, status!.description])
    );

    const transactionsTable = transactions.map((transaction) => {
      const description = statusMap.get(transaction.statusId!);
      if (description) {
        transaction.statusId = description;
      }
      return transaction;
    });

    return (
      <LayoutContainer>
        <section className="space-y-2">
          <div className="flex justify-between">
            {transactionsTable && (
              <TransactionsPage transactions={transactionsTable} />
            )}
          </div>
        </section>
      </LayoutContainer>
    );
  } catch (error) {
    const transactions = await api.transactions.list.query();
    const statusIds = transactions.map((transaction) => transaction.statusId);
    console.log("statusIds", statusIds.length);
    console.log("transactions", transactions.length);
    console.error("Error loading transactions or statuses:", error);
    return <div>No se encontraron cobros</div>;
  }
}
