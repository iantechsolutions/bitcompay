"use client";

import { Title } from "~/components/title";
import { api } from "~/trpc/react";
import UploadDropzoneV1 from "~/components/upload-dropzone";
import LayoutContainer from "~/components/layout-container";
import { useState } from "react";

export default function Page(props: { params: { healthInsuranceId: string } }) {
  const { healthInsuranceId } = props.params;
  const [errorMessage, setErrorMessage] = useState<string | null>();

  // Fetch the plan using the companyId and planId
  const healthInsurance = api.healthInsurances.getWithComprobantes.useQuery({
    healthInsuranceId,
  });

  if (!healthInsurance) {
    return <Title>No se encontró el obra social</Title>;
  }

  return (
    <LayoutContainer>
      <Title>Cargar aportes de obra social</Title>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <UploadDropzoneV1 />
    </LayoutContainer>
  );
}
