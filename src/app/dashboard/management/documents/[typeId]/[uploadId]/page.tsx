import dayjs from "dayjs";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { formatKB } from "~/lib/utils";
import { api } from "~/trpc/server";

export default async function Page(props: {
  params: {
    uploadId: string;
  };
}) {
  const upload = await api.uploads.get.query({
    uploadId: props.params.uploadId,
  });

  if (!upload) return <Title>Document no encontrado</Title>;

  return (
    <>
      <Title>{upload.fileName}</Title>
      {!upload.confirmed && (
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
        {upload.confirmed && (
          <p>
            Transaccions cargadas desde este archivo: <b>{upload.rowsCount}</b>
          </p>
        )}
      </div>
      {upload.confirmed && (
        <Button className="mt-2">
          Ver transacciones cargadas desde este archivo
        </Button>
      )}
    </>
  );
}
