
import AppSidenav from "~/components/admin-sidenav";
import AppLayout from "~/components/applayout";
import { Title } from "~/components/title";
import { getServerAuthSession } from "~/server/auth";
import UploadPage from "./upload-page";

export default async function Home() {
    const session = await getServerAuthSession();

    return (
        <AppLayout
            title={<h1>Cargar documento</h1>}
            user={session?.user}
            sidenav={<AppSidenav />}
        >
            <UploadPage />
        </AppLayout>
    );
}