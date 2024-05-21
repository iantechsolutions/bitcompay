import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import ResponseConfirmedPage from './confirmed-page'
import ResponseUnconfirmedPage from './unconfirmed-page'

export default async function Home(props: { params: { uploadId: string } }) {
    const upload = await api.uploads.responseUpload.query({
        id: props.params.uploadId,
    })

    if (!upload) {
        return <Title>El documento no existe.</Title>
    }

    return (
        <>
            {!upload.confirmed && <ResponseUnconfirmedPage upload={upload} />}
            {upload.confirmed && <ResponseConfirmedPage upload={upload} />}
        </>
    )
}
