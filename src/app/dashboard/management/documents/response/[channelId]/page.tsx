import { api } from '~/trpc/server'
import UploadResponsePage from './upload-response-page'

export default async function PageResponse(props: {
    params: { channelId: string }
}) {
    const channel = await api.channels.get.query({
        channelId: props.params.channelId,
    })

    return <>{channel && <UploadResponsePage channel={channel} />}</>
}
