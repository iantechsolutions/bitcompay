import LayoutContainer from '~/components/layout-container'
import { Title } from '~/components/title'
import type { RouterOutputs } from '~/trpc/shared'

export type UploadedPageProps = {
    upload: NonNullable<RouterOutputs['uploads']['responseUpload']>
}

export default function ResponseConfirmedPage(_props: UploadedPageProps) {
    return (
        <LayoutContainer>
            <Title>Carga de archivo finalizada</Title>
        </LayoutContainer>
    )
}
