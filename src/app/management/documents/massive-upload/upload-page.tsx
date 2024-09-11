"use client";

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "~/components/uploadthing";
import UploadDropzoneV1 from "~/components/upload-dropzone";

export default function UploadPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>();

  return (
    <LayoutContainer>
      <Title>Cargar documento para generación masiva</Title>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <UploadDropzoneV1 />
    </LayoutContainer>
  );
}
