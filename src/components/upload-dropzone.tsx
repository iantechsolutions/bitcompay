"use client";
import { UploadDropzone } from "~/components/uploadthing";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyData } from "~/app/dashboard/company-provider";

export default function UploadDropzoneV1() {
  const [errorMessage, setErrorMessage] = useState<string | null>();

  const router = useRouter();
  const company = useCompanyData();

  return (
    <div>
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
          // toast.success('Archivo!');
          router.push(`./massive-upload/${file.serverData.uploadId}`);
        }}
        onUploadError={(error: Error) => {
          setErrorMessage(error.message);
        }}
      />
    </div>
  );
}
