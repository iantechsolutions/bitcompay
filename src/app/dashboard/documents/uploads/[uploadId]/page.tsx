
import AppSidenav from "~/components/app-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import UploadedPage from "./uploaded-unconfirmed-page";
import { api } from "~/trpc/server";
import UploadedUnconfirmedPage from "./uploaded-unconfirmed-page";
import UploadedConfirmedPage from "./uploaded-confirmed-page";

export default async function Home(props: {
    params: { uploadId: string }
}) {
    const session = await getServerAuthSession();

    const upload = await api.uploads.upload.query({ id: props.params.uploadId })

    if (!upload) {
        return <AppLayout
            title={<h1>Error 404</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <Title>El documento no existe.</Title>
        </AppLayout>
    }

    return (
        <AppLayout
            title={<h1>Documento cargado ({upload.id})</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            {!upload.confirmed && <UploadedUnconfirmedPage
                upload={upload}
            />}
            {upload.confirmed && <UploadedConfirmedPage 
                upload={upload}
            />}
        </AppLayout>
    );
}