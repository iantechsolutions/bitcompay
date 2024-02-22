import { CircleDollarSignIcon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";

export default async function TransactionsPage() {
    const transactions = await api.transactions.list.query()

    return <>
        <Title>Transacciones</Title>
        <List>
            {transactions.map((transaction) => {
                return <ListTile
                    leading={<CircleDollarSignIcon />}
                    key={transaction.id}
                    title={transaction.name}
                    subtitle={`${transaction.fiscal_id_number} - ${transaction.channel?.split(' ')[3]}`}
                    trailing={`$${transaction.first_due_amount?.toLocaleString()}`}
                />
            })}
        </List>
    </>
}