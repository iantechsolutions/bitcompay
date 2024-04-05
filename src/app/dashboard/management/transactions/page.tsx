import { api } from "~/trpc/server";
import TransactionsPage from "./transactions-page";

export default async function Page() {
  const transactions = await api.transactions.list.query();

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 h-[calc(100dvh_-_70px)]">
      <TransactionsPage transactions={transactions} />
    </div>
  );
}
