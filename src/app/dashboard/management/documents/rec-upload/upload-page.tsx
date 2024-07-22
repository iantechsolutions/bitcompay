"use client";

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "~/components/uploadthing";
import { useAuth } from "@clerk/nextjs";
import AccessDenied from "~/app/accessdenied/page";

export default function UploadPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>();

  const router = useRouter();

  const { orgId } = useAuth();
  if (!orgId) return <AccessDenied />;
  return (
    <LayoutContainer>
      <Title>Cargar documento</Title>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <UploadDropzone
        input={{ companyId: orgId }}
        endpoint="documentUpload"
        config={{
          mode: "manual",
          appendOnPaste: true,
        }}
        content={{
          button: "Continuar",
          allowedContent: "Archivos de excel",
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

          if (!file) return;

          router.push(`./rec-upload/${file.serverData.uploadId}`);
        }}
        onUploadError={(error: Error) => {
          setErrorMessage(error.message);
        }}
      />
    </LayoutContainer>
  );
}
