"use client"

import dayjs from "dayjs";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

export default function GenerateChannelOutputPage(props: { channel: NonNullable<RouterOutputs['channels']['get']> }) {

    const { mutateAsync: generateInputFile, isLoading, isSuccess, error, data } = api.iofiles.generate.useMutation()

    function handleGenerate() {
        generateInputFile({ channelNumber: props.channel.number })
    }

    const dateYYYYMMDD = dayjs().format('YYYY-MM-DD')

    const dataDataURL = data ? `data:text/plain;charset=utf-8,${encodeURIComponent(data)}` : null

    return <>
        <Title>{props.channel?.name}: Generar entrada</Title>
        <Button onClick={handleGenerate} size="lg" className="w-full" disabled={isLoading}>{isLoading && <Loader2Icon className="mr-2 animate-spin" />}Generar</Button>
        {data != undefined && <div className="mt-5">
            <Title>Resultado</Title>
            {dataDataURL && <a href={dataDataURL} download={`entrada-${dateYYYYMMDD}.txt`}>
                <Button size="lg">
                    <DownloadIcon className="mr-2" />
                    Descargar archivo
                </Button>
            </a>}
            <pre className="border border-dashed p-4 rounded-md overflow-auto mt-5">
                {data}
                {!data && <p className="my-10 text-center text-sm text-stone-500">No se generó nada</p>}
            </pre>
        </div>}
    </>
}