import dayjs from "dayjs";
import { AlertCircleIcon, CheckIcon } from "lucide-react";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { formatKB } from "~/lib/utils";
import { api } from "~/trpc/server";

export default async function UploadedDocumentsPage() {
    const uploadedDocuments = await api.uploads.list.query()

    return <>
        <Title>Documentos subidos</Title>
        <List>
            {uploadedDocuments.map(upload => <ListTile
                key={upload.id}
                href={`/dashboard/management/documents/${upload.id}`}
                leading={upload.confirmed ? <CheckIcon /> : <AlertCircleIcon />}
                title={upload.fileName}
                subtitle={<>
                    {formatKB(upload.fileSize)}
                    {' - '}
                    {dayjs(upload.createdAt).format('DD/MM/YYYY')}
                </>}
                trailing={<>{upload.rowsCount}</>}
            />)}
        </List>
    </>
}