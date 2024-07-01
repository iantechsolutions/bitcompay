import { api } from "~/trpc/server";
import BonusPage from "./bonus-page";
export default async function Home(props: { params: { bonusId: string } }) {
  const bonus = await api.bonuses.get.query({
    bonusesId: props.params.bonusId,
  });
  if (!bonus) {
    return <div>No se encontró el bono</div>;
  }
  return <BonusPage bonus={bonus} />;
}
