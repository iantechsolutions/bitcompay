import dayjs from 'dayjs'
import { AlertCircleIcon, CheckIcon } from 'lucide-react'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { formatKB } from '~/lib/utils'
import { api } from '~/trpc/server'

const Page = async (props: { params: { typeId: string } }) => {
    const uploadedDocuments = await api.uploads.list.query()
    const responseUploadedDocuments = await api.uploads.listResponse.query()
    const uploadedOutputFiles = await api.uploads.listOutput.query()
    return (
        <>
            <Title>Documentos subidos</Title>
            {props.params.typeId === 'c2LQxo7Z294z7XXwZpMpj' && (
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
                                    {' - '}
                                    {dayjs(upload.createdAt).format('DD/MM/YYYY')}
                                </>
                            }
                            trailing={upload.rowsCount}
                        />
                    ))}
                </List>
            )}
            {props.params.typeId === 'KNPqhFLCGiXktr3SmuwNI' && (
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
                                    {' - '}
                                    {dayjs(upload.createdAt).format('DD/MM/YYYY')}
                                </>
                            }
                            trailing={upload.rowsCount}
                        />
                    ))}
                </List>
            )}
            {props.params.typeId === 'rzRGJTyxSnB9UVPAxbljo' && (
                <List>
                    {uploadedOutputFiles.map((upload) => (
                        <ListTile
                            key={upload.id}
                            href={`/dashboard/management/documents/${props.params.typeId}/${upload.id}`}
                            title={upload.fileName}
                            subtitle={
                                <>
                                    {formatKB(upload.fileSize)}
                                    {' - '}
                                    {dayjs(upload.createdAt).format('DD/MM/YYYY')}
                                </>
                            }
                        />
                    ))}
                </List>
            )}
        </>
    )
}

export default Page
