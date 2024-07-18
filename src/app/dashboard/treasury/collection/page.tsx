import { api } from "~/trpc/server";
import TransactionsPage from "./transactions-page";

export default async function Page() {
  try {
    const transactions = await api.transactions.list.query();

    const statusIds = transactions.map((transaction) => transaction.statusId);
    const statuses = await Promise.all(
      statusIds.map((statusId) => api.status.get.query({ statusId: statusId! }))
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
      <div className="absolute bottom-0 left-0 right-0 top-0 h-[calc(100dvh_-_70px)]">
        {transactionsTable && (
          <TransactionsPage transactions={transactionsTable} />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading transactions or statuses:", error);
    return <div>No se encontraron cobros</div>;
  }
}
