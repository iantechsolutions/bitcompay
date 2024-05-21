import { api } from '~/trpc/server'
import TransactionsPage from './transactions-page'

export default async function Page() {
    const transactions = await api.transactions.list.query()
    const transactionsTable = await Promise.all(
        transactions.map(async (transaction) => {
            if (transaction.statusId) {
                const payment_status = await api.status.get.query({
                    statusId: transaction.statusId,
                })
                transaction.statusId = payment_status!.description
            } else if (!transaction.outputFileId) {
                transaction.statusId = 'CARGADO'
            } else if (transaction.outputFileId) {
                transaction.statusId = 'ARCHIVO GENERADO'
            }
            return transaction
        }),
    )

    return (
        <div className='absolute top-0 right-0 bottom-0 left-0 h-[calc(100dvh_-_70px)]'>
            {transactionsTable && <TransactionsPage transactions={transactionsTable} />}
        </div>
    )
}
