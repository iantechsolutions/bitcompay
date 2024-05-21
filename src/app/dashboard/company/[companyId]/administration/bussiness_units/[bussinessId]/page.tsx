import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import BussinessPage from './bussiness-page'

export default async function Page(props: { params: { bussinessId: string } }) {
    const bussinessUnit = await api.bussinessUnits.get.query({
        bussinessUnitId: props.params.bussinessId,
    })

    if (!bussinessUnit) {
        return <Title>No se encontraron las unidades de negocio</Title>
    }

    return <BussinessPage unit={bussinessUnit} />
}
