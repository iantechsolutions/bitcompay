import { Title } from "~/components/title";
import { RouterOutputs } from "~/trpc/shared";
import LayoutContainer from "~/components/layout-container";

export default function DetailsPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <div className="flex-col">
            <Title>Editar plan {props.plan!.description}</Title>
          </div>
        </div>
      </section>
    </LayoutContainer>
  );
}
