"use client";

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "~/components/uploadthing";
import { useCompanyData } from "../../company-provider";

export default function UploadPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>();

  const router = useRouter();

  const company = useCompanyData();

  return (
    <LayoutContainer>
      <Title>Cargar documento para generación masiva</Title>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <UploadDropzone
        input={{ companyId: company.id }}
        endpoint="massiveGenerationUpload"
        config={{
          mode: "manual",
          appendOnPaste: true,
        }}
        content={{
          button: "Continuar",
          allowedContent: "Archivos de excel",
          label: "Arrastra y suelta el archivo aquí",
        }}
        onClientUploadComplete={(res) => {
          const [file] = res;

          if (!file) return;

          router.push(`./massive-generation/${file.serverData.uploadId}`);
        }}
        onUploadError={(error: Error) => {
          setErrorMessage(error.message);
        }}
      />
    </LayoutContainer>
  );
}
