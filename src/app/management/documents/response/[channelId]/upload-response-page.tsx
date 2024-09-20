"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { UploadDropzone } from "~/components/uploadthing";
import type { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import {Establishment} from "~/server/db/schema";
export default function UploadResponsePage(props: {
  channel: NonNullable<RouterOutputs["channels"]["get"]>;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const router = useRouter();

  const channelName = props.channel.name;
  const validChannels = [
    "PAGOFACIL",
    "DEBITO DIRECTO CBU",
    "RAPIPAGO",
    "DEBITO AUTOMATICO",
    "PAGOMISCUENTAS",
  ];

  useEffect(() => {
    if (!validChannels.includes(channelName)) {
      setDisabled(true);
    }
  }, [channelName]);

  const brands =  api.brands.list.useQuery().data || []
  const establishments : Establishment[]= brands.reduce<Establishment[]>((acc, brand) => {
    if (brand.establishments) {
      acc.push(...brand.establishments);
    }
    return acc;
  }, []);
  if(establishments.length === 0){
    return (
      <LayoutContainer>
         <Title>Cargar documento</Title>
          <p className="text-red-500">No hay establecimientos asociados a la marca</p>
      </LayoutContainer>
    )
  }

  return (
    <LayoutContainer pageName={channelName}>
      <Title>Cargar documento</Title>

      {disabled && (
        <div>
          {" "}
          <p className="text-red-500">El canal no se encuentra habilitado</p>
          <p>Canales habilitados: {validChannels.join(", ")}.</p>
        </div>
      )}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {!disabled && (
        <UploadDropzone
          input={{ channel: channelName }}
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
                src="/public/Uploaded-icon.png"
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
      )}
    </LayoutContainer>
  );
}
