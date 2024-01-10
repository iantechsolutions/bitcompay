"use client"

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { UploadButton } from "~/components/uploadthing";
import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const [errorMessage, setErrorMessage] = useState<string | null>();

    const router = useRouter()

    return <LayoutContainer>
        <Title>Cargar documento</Title>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <UploadDropzone<OurFileRouter, any>
            endpoint="documentUpload"
            config={{
                mode: 'manual',
                appendOnPaste: true,
            }}
            content={{
                button: 'Continuar',
                allowedContent: 'Archivos de excel',
                label: 'Arrastra y suelta el archivo aquí',
            }}
            onClientUploadComplete={(res) => {
                const [file] = res

                if(!file) return

                router.push(`/dashboard/documents/uploads/${file.serverData.uploadId}`)
            }}
            onUploadError={(error: Error) => {
                setErrorMessage(error.message);
            }}
        />
    </LayoutContainer>
}