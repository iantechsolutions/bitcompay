import { api } from "~/trpc/server";
import TransactionsPage from "./transactions-page";

export default async function Page() {
  const transactions = await api.transactions.list.query();
  const transactionsTable = await Promise.all(
    transactions.map(async (transaction) => {
      const payment_status = await api.status.get.query({
        statusId: transaction.status_code!,
      });
      transaction.status_code = payment_status!.description;
      return transaction;
    }),
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 h-[calc(100dvh_-_70px)]">
      {transactionsTable && (
        <TransactionsPage transactions={transactionsTable} />
      )}
    </div>
  );
}
