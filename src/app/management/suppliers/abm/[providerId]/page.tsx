import { Title } from '~/components/title'
import { api } from '~/trpc/server'

import ProviderPage from './provider-page'
export default async function Page(props: { params: { providerId: string } }) {
    const provider = await api.providers.get.query({
        providerId: props.params.providerId,
    })

    if (!provider) {
        return <Title>No se encontró el proveedor</Title>
    }

    return <ProviderPage provider={provider} />
}
