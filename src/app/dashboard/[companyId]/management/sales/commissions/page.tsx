import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";



export default async function Page(props: { params: { companyId: string } }) {
  // cambiar luego por tramite router

  return (
    <LayoutContainer>
        <section className="space-y-2">
        <div className="flex justify-between">
            <Title>Comisiones</Title>
        </div>
        </section>
    </LayoutContainer>
  );
}
