"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";

import { type RouterOutputs } from "~/trpc/shared";
import LayoutContainer from "~/components/layout-container";
import { Card } from "~/components/ui/card";

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
      <section className="p-6 bg-gray-100 rounded-lg shadow-md">
        <div className="flex flex-row justify-between mt-4">
          <div className="flex flex-row gap-6">
            <h2 className="flex items-center text-2xl font-semibold mb-2 text-gray-800">
              Obra Social
            </h2>
            <h3 className="flex items-center text-lg font-medium text-gray-600">
              {props.healthInsurance.identificationNumber}{" "}
              {props.healthInsurance.initials}
            </h3>
          </div>
        </div>
        <Card className="mt-6 p-4 bg-white shadow-sm rounded-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">
              Identificación: {props.healthInsurance.identificationNumber}
            </p>
            <p className="text-sm font-medium text-gray-700">
              CUIT: {props.healthInsurance.fiscal_id_number}
            </p>
            <p className="text-sm font-medium text-gray-700">
              Iniciales: {props.healthInsurance.initials}
            </p>
            <p className="text-sm font-medium text-gray-700">
              Descripcion: {props.healthInsurance.description}
            </p>
          </div>
        </Card>
      </section>
    </LayoutContainer>
  );
}
