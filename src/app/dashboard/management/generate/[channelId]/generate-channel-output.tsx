"use client"

import { Loader2Icon } from "lucide-react";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

export default function GenerateChannelOutputPage(props: { channel: NonNullable<RouterOutputs['channels']['get']> }) {

    const { mutateAsync: generateInputFile, isLoading, isSuccess, error, data } = api.iofiles.generate.useMutation()

    function handleGenerate() {
        generateInputFile({ channelNumber: props.channel.number })
    }

    return <>
        <Title>{props.channel?.name}: Generar entrada</Title>
        <Button onClick={handleGenerate} size="lg" className="w-full" disabled={isLoading}>{isLoading && <Loader2Icon className="mr-2 animate-spin" />}Generar</Button>
        {data != undefined && <div className="mt-5">
            <Title>Resultado</Title>
            <pre className="border border-dashed p-4 rounded-md overflow-auto">
                {data}
                {!data && <p className="my-10 text-center text-sm text-stone-500">No se generó nada</p>}
            </pre>
        </div>}
    </>
}