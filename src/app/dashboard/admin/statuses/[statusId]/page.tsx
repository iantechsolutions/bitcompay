import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import StatusPage from './status-page'

export default async function Page(props: { params: { statusId: string } }) {
    const status = await api.status.get.query({
        statusId: props.params.statusId,
    })

    if (!status) {
        return <Title>No se encontró el Estado buscado</Title>
    }

    return <StatusPage status={status} />
}
