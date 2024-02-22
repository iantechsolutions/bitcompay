"use client"

import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { RouterOutputs } from "~/trpc/shared";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
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
    upload: NonNullable<RouterOutputs['uploads']['upload']>
}

export default function UploadedUnconfirmedPage(props: UploadedPageProps) {
    const router = useRouter()

    const { upload } = props

    const [documentType, setDocumentType] = useState<string | null>(null)

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

    const { mutateAsync: readUploadContents, isLoading } = api.uploads.readUploadContents.useMutation()
    const { mutateAsync: confirmUpload, isLoading: isLoadingConfirm } = api.uploads.confirmUpload.useMutation()

    async function handlerConfirm() {
        if (!data) return
        if (!documentType) return
        if (isLoadingConfirm) return

        try {
            await confirmUpload({ id: upload.id })
            toast.success('Documento cargado correctamente')
            router.refresh()
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
        }
    }

    const [error, setError] = useState<string | null>(null)

    const [data, setData] = useState<RouterOutputs['uploads']['readUploadContents'] | null>(null)

    async function handleContinue() {
        if (!documentType) return
        if (isLoading) return

        try {
            setError(null)
            const data = await readUploadContents({ id: upload.id, type: (documentType as any) })
            if (data) setData(data)
        } catch (e) {
            const error = asTRPCError(e)!
            toast.error(error.message)
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
            <SelectGroup>
                <SelectLabel>Tipo de documento</SelectLabel>
                <Select
                    onValueChange={setDocumentType}
                    value={documentType || undefined}
                >
                    <SelectTrigger className="w-full" >
                        <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {/* <SelectLabel></SelectLabel> */}
                            <SelectItem value="rec">REC</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </SelectGroup>
            {error && <p className="text-red-500 font-semibold">{error}</p>}
            <Button
                className="py-6 w-full"
                variant="outline"
                disabled={!documentType || isLoading}
                onClick={handleContinue}
            >Leer datos</Button>
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
                rows={data.rows}
                headers={data.headers}
            />}
        </div>
    </>
}


