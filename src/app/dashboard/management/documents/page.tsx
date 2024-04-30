import dayjs from "dayjs";
import {
  AlertCircleIcon,
  CheckIcon,
  FileOutput,
  MessageSquareReply,
  File,
} from "lucide-react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { formatKB } from "~/lib/utils";
import { api } from "~/trpc/server";

export default async function UploadedDocumentsPage() {
  const uploadedDocuments = await api.uploads.list.query();
  //   c2LQxo7Z294z7XXwZpMpj
  // rzRGJTyxSnB9UVPAxbljo
  // KNPqhFLCGiXktr3SmuwNI
  const documentsTypes = [
    {
      id: "c2LQxo7Z294z7XXwZpMpj",
      name: "Recaudaciones",
      leading: <File />,
    },
    { id: "rzRGJTyxSnB9UVPAxbljo", name: "Salida", leading: <FileOutput /> },
    {
      id: "KNPqhFLCGiXktr3SmuwNI",
      name: "Respuesta",
      leading: <MessageSquareReply />,
    },
  ];
  return (
    <>
      <Title>Documentos subidos</Title>
      <List>
        {documentsTypes.map((type) => (
          <ListTile
            key={type.id}
            title={type.name}
            leading={type.leading}
            href={`/dashboard/management/documents/${type.id}`}
          />
        ))}
      </List>
      <List>
        {uploadedDocuments.map((upload) => (
          <ListTile
            key={upload.id}
            href={`/dashboard/management/documents/${upload.id}`}
            leading={upload.confirmed ? <CheckIcon /> : <AlertCircleIcon />}
            title={upload.fileName}
            subtitle={
              <>
                {formatKB(upload.fileSize)}
                {" - "}
                {dayjs(upload.createdAt).format("DD/MM/YYYY")}
              </>
            }
            trailing={<>{upload.rowsCount}</>}
          />
        ))}
      </List>
    </>
  );
}
