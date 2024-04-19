"use server";

import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import UploadedUnconfirmedPage from "./uploaded-unconfirmed-page";
import { RouterOutputs } from "~/trpc/shared";
import UploadedConfirmedPage from "./uploaded-confirmed-page";
// import UploadedConfirmedPage from "./uploaded-confirmed-page";
// import { ReceiveDataProvider } from "./upload-provider";

export type UploadContainerProps = {
  upload: NonNullable<RouterOutputs["uploads"]["upload"]>;
};

export default async function Home(props: UploadContainerProps) {
  let batch: any;
  const receiveData = (data: any) => {
    const batch = data;
  };

  return (
    <>
      {!props.upload.confirmed && (
        <UploadedUnconfirmedPage upload={props.upload} sendData={receiveData} />
      )}
      {props.upload.confirmed && (
        <UploadedConfirmedPage upload={props.upload} dataBatch={batch} />
      )}
    </>
  );
}
