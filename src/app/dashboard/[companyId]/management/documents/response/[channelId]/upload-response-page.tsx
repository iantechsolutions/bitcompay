"use client";

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "~/components/uploadthing";
import { RouterOutputs } from "~/trpc/shared";

export default function UploadResponsePage(props: {
  channel: NonNullable<RouterOutputs["channels"]["get"]>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>();

  const router = useRouter();

  return (
    <LayoutContainer>
      <Title>Cargar documento</Title>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <UploadDropzone
        input={{ channel: props.channel.name }}
        endpoint="responseUpload"
        config={{
          mode: "manual",
          appendOnPaste: true,
        }}
        content={{
          button: "Continuar",
          allowedContent: "Archivos de txt",
          label: "Arrastra y suelta el archivo aquí",
        }}
        onClientUploadComplete={(res) => {
          const [file] = res;

          if (!file) return;

          router.push(`./${props.channel.id}/${file.serverData.uploadId}`);
        }}
        onUploadError={(error: Error) => {
          setErrorMessage(error.message);
        }}
      />
    </LayoutContainer>
  );
}
