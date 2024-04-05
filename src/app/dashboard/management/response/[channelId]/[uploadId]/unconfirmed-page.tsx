"use client"

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import type { RouterOutputs } from "~/trpc/shared";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { FileSpreadsheetIcon } from "lucide-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { LargeTable } from "~/components/table";
import { toast } from "sonner"
import { asTRPCError } from "~/lib/errors";


export type UploadedPageProps = {
    upload: NonNullable<RouterOutputs['uploads']['responseUpload']>
}

export default function ResponseUnconfirmedPage(props: UploadedPageProps) {
    const router = useRouter()

    const { upload } = props

    const [documentType] = useState<'txt'>('txt')


    let fileSizeLabel: React.ReactNode = null

    if (upload.fileSize < 1000) {
        fileSizeLabel = <span>{upload.fileSize} bytes</span>
    }

    if (upload.fileSize >= 1000 && upload.fileSize < 1000 * 1000) {
        fileSizeLabel = <span>{(upload.fileSize / 1000).toFixed(1)} KB</span>
    }

    if (upload.fileSize >= 1000 * 1000) {
        fileSizeLabel = <span>{(upload.fileSize / 1000 / 1000).toFixed(1)} MB</span>
    }

    const { mutateAsync: readResponseUploadContents, isLoading, error: dataError } = api.uploads.readResponseUploadContents.useMutation()
    const { mutateAsync: confirmResponseUpload, isLoading: isLoadingConfirm } = api.uploads.confirmResponseUpload.useMutation()

    async function handlerConfirm() {
        if (!data) return
        if (!documentType) return
        if (isLoadingConfirm) return

        try {
            await confirmResponseUpload({ uploadId: upload.id})
            toast.success('Documento cargado correctamente')
            router.refresh()
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<RouterOutputs['uploads']['readResponseUploadContents'] | null>(null)

    async function handleContinue() {
        if (!documentType) return
        if (isLoading) return

        try {
            setError(null)
            const data = await readResponseUploadContents({ uploadId: upload.id, type: documentType})
            if (data) setData(data)
        } catch (e) {
            console.error(e)
            return
        }
    }


    return <>
        <LayoutContainer>
            <Title>Proceso de carga</Title>

            <Card className="flex gap-3 p-3 items-center">
                <div className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-stone-100">
                    <FileSpreadsheetIcon />
                </div>
                <div className="">
                    <p className="text-md font-medium">{upload.fileName}</p>
                    <p className="text-xs font-semibold">{fileSizeLabel} - subido el {dayjs(upload.createdAt).format('DD/MM/YYYY [a las] HH:mm:ss')}</p>
                </div>
            </Card>
            {error && <p className="text-red-500 font-semibold">{error}</p>}
            <Button
                className="py-6 w-full"
                variant="outline"
                disabled={!documentType || isLoading}
                onClick={handleContinue}
            >Leer datos</Button>


            {dataError && <pre className="border border-dashed p-4 rounded-md overflow-auto mt-5">
                {dataError.data?.cause?.trim() ?? dataError.message}
            </pre>}

            <div className="flex gap-2">
                <Button
                    variant="destructive"
                >Cancelar y eliminar</Button>

                {data && <Button
                    onClick={handlerConfirm}
                >
                    Confirmar y escribir a la base de datos
                </Button>}
            </div>
        </LayoutContainer>
        <div className="mt-5">
            {data && <LargeTable
                rows={data.records}
                headers={data.header}
            />}
        </div>
    </>
}


