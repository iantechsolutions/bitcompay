import { File, FileOutput, MessageSquareReply } from 'lucide-react'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'

export default async function UploadedDocumentsPage() {
    const documentsTypes = [
        {
            id: 'c2LQxo7Z294z7XXwZpMpj',
            name: 'Recaudaciones',
            leading: <File />,
        },
        { id: 'rzRGJTyxSnB9UVPAxbljo', name: 'Salida', leading: <FileOutput /> },
        {
            id: 'KNPqhFLCGiXktr3SmuwNI',
            name: 'Respuesta',
            leading: <MessageSquareReply />,
        },
    ]
    return (
        <>
            <Title>Documentos subidos</Title>
            <List>
                {documentsTypes.map((type) => (
                    <ListTile key={type.id} title={type.name} leading={type.leading} href={`/dashboard/management/documents/${type.id}`} />
                ))}
            </List>
        </>
    )
}
