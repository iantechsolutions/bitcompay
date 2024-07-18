"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { UploadDropzone } from "~/components/uploadthing";
import type { RouterOutputs } from "~/trpc/shared";

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
          uploadIcon: (
            <img
              src="/Uploaded-icon.png"
              alt="Upload Icon"
              width={50}
              height={50}
            />
          ),
        }}
        appearance={{
          uploadIcon: {
            color: "#79edd6",
          },
          container: {
            border: "1px dotted #79edd6",
          },
          label: {
            color: "#79edd6",
          },
        }}
        onClientUploadComplete={(res) => {
          const [file] = res;

          if (!file) {
            return;
          }

          router.push(`./${props.channel.id}/${file.serverData.uploadId}`);
        }}
        onUploadError={(error: Error) => {
          setErrorMessage(error.message);
        }}
      />
    </LayoutContainer>
  );
}
