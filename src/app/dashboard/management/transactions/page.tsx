import { api } from "~/trpc/server";
import TransactionsPage from "./transactions-page";

export default async function Page() {
    const transactions = await api.transactions.list.query()
    
    return <div className="absolute left-0 top-0 right-0 bottom-0 h-[calc(100dvh_-_70px)]">
        <TransactionsPage
            transactions={transactions}
        />
    </div>
}