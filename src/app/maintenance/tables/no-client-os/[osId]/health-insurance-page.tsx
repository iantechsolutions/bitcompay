"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";

import { type RouterOutputs } from "~/trpc/shared";

import LayoutContainer from "~/components/layout-container";

dayjs.extend(utc);
dayjs.locale("es");

export default function NonOsPage(props: {
  healthInsurance: RouterOutputs["healthInsurances"]["get"];
}) {
  const router = useRouter();
  if (!props.healthInsurance) {
    console.error("healthInsurance no está definido");
    return <div>Error: healthInsurance no está definido</div>;
  }
  return (
    <LayoutContainer>
      <section>
        <div className="flex flex-row justify-between mt-4">
          <div className="flex flex-row  gap-6">
            <h2 className="flex items-center text-2xl font-semibold mb-2">
              Obra Social
            </h2>
            <h3 className="flex items-center text-lg font-medium">
              {props?.healthInsurance?.identificationNumber}{" "}
              {props?.healthInsurance?.initials}
            </h3>
          </div>
        </div>
      </section>
    </LayoutContainer>
  );
}
