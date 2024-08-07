'use client'
import type { RouterOutputs } from '~/trpc/shared'
import UploadedConfirmedPage from './uploaded-confirmed-page'
import UploadedUnconfirmedPage from './uploaded-unconfirmed-page'
// import UploadedConfirmedPage from "./uploaded-confirmed-page";
// import { ReceiveDataProvider } from "./upload-provider";

export type UploadContainerProps = {
    upload: NonNullable<RouterOutputs['uploads']['upload']>
}

export default function Home(props: UploadContainerProps) {
  let batch: Record<string, unknown>[];
  const receiveData = (data: Record<string, unknown>[]) => {
    batch = data;
  };

    return (
        <>
            {!props.upload.confirmed && <UploadedUnconfirmedPage upload={props.upload} />}
            {props.upload.confirmed && <UploadedConfirmedPage upload={props.upload} dataBatch={batch!} />}
        </>
    )
}
