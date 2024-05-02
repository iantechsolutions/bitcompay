import { api } from "~/trpc/server";
import { CheckIcon, AlertCircleIcon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import dayjs from "dayjs";
import { formatKB } from "~/lib/utils";

const Page = async (props: { params: { typeId: string } }) => {
  const uploadedDocuments = await api.uploads.list.query();
  const responseUploadedDocuments = await api.uploads.listResponse.query();

  // else if(props.params.typeId==="rzRGJTyxSnB9UVPAxbljo"){
  //     //archivos generados
  // }
  return (
    <>
      <Title>Documentos subidos</Title>
      {props.params.typeId === "c2LQxo7Z294z7XXwZpMpj" && (
        <List>
          {uploadedDocuments.map((upload) => (
            <ListTile
              key={upload.id}
              href={`/dashboard/management/documents/${props.params.typeId}/${upload.id}`}
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
      )}
      {props.params.typeId === "KNPqhFLCGiXktr3SmuwNI" && (
        <List>
          {responseUploadedDocuments.map((upload) => (
            <ListTile
              key={upload.id}
              href={`/dashboard/management/documents/${props.params.typeId}/${upload.id}`}
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
      )}
    </>
  );
};

export default Page;
