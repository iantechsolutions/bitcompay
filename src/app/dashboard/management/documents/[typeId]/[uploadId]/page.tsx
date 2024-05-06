import dayjs from "dayjs";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { formatKB } from "~/lib/utils";
import { api } from "~/trpc/server";

export default async function Page(props: {
  params: {
    uploadId: string;
    typeId: string;
  };
}) {
  let upload;
  if (props.params.typeId === "c2LQxo7Z294z7XXwZpMpj") {
    upload = await api.uploads.get.query({
      uploadId: props.params.uploadId,
    });
  } else if (props.params.typeId === "KNPqhFLCGiXktr3SmuwNI") {
    upload = await api.uploads.responseUpload.query({
      id: props.params.uploadId,
    });
  } else if (props.params.typeId === "rzRGJTyxSnB9UVPAxbljo") {
    upload = await api.uploads.outputUpload.query({
      id: props.params.uploadId,
    });
  }

  if (!upload) return <Title>Documento no encontrado</Title>;

  return (
    <>
      <Title>{upload.fileName}</Title>
      {"confirmed" in upload && !upload.confirmed && (
        <Button variant="destructive" className="mb-2">
          Cancelar carga y eliminar
        </Button>
      )}
      <div>
        <p>
          Tamaño: <b>{formatKB(upload.fileSize)}</b>
        </p>
        <p>
          Fecha de subida: <b>{dayjs(upload.createdAt).format("DD/MM/YYYY")}</b>
        </p>
        {"confirmed" in upload && upload.confirmed && (
          <p>
            Transaccions cargadas desde este archivo: <b>{upload.rowsCount}</b>
          </p>
        )}
      </div>
      {"confirmed" in upload && upload.confirmed && (
        <Button className="mt-2">
          Ver transacciones cargadas desde este archivo
        </Button>
      )}
    </>
  );
}
