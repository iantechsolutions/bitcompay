"use client";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import type { RouterOutputs } from "~/trpc/shared";
import { Button } from "~/components/ui/button";
// import { useReceiveData } from "./upload-provider";
export type UploadedPageProps = {
  upload: NonNullable<RouterOutputs["uploads"]["upload"]>;
  dataBatch: Record<string, unknown>[];
};

export default function UploadedConfirmedPage(props: UploadedPageProps) {
  const { confirmedAt, fileName } = props.upload;
  const { dataBatch } = props;

  console.log(confirmedAt, fileName, dataBatch);
  return (
    <LayoutContainer>
      <Title>Carga de archivo finalizada</Title>
      <Button size="lg" className="w-full">
        Generar Comprobante de salida
      </Button>
    </LayoutContainer>
  );
}
