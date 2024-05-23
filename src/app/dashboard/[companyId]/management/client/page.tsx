import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { AddClientDialog } from "./add-client-dialog";


export default async function Page(props: { params: { companyId: string } }) {
  // cambiar luego por tramite router

  return (
    <LayoutContainer>
        <section className="space-y-2">
        <div className="flex justify-between">
            <Title>Cleintes</Title>
            <AddClientDialog/>
        </div>
        </section>
    </LayoutContainer>
  );
}
