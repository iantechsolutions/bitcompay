import { Title } from "@radix-ui/react-toast";
import { api } from "~/trpc/server";


export default async function Page(props: { params: { procedureId: string } }) {
    const product = await api.procedure.get.query({
        procedureId: props.params.procedureId,
    });

    return(
        <div>
            <h1>Factura Nº {product?.id}</h1>
        </div>
    )
}