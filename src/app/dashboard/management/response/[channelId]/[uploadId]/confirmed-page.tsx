import LayoutContainer from "~/components/layout-container"
import { Title } from "~/components/title"
import { RouterOutputs } from "~/trpc/shared"

export type UploadedPageProps = {
    upload: NonNullable<RouterOutputs['uploads']['responseUpload']>
}

export default function ResponseConfirmedPage(props: UploadedPageProps) {
    return (
        <LayoutContainer>
            <Title>Carga de archivo finalizada</Title>
        </LayoutContainer>
    )
}