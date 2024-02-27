import { Title } from "~/components/title"
import { api } from "~/trpc/server"
import ProductPage from "./product-page"

export default async function Page(props: { params: { productId: string } }) {
    const product = await api.products.get.query({ productId: props.params.productId })
    const channels = await api.channels.list.query()
   
    if(!product) return <Title>No se encontró el producto</Title>

    return <ProductPage product={product} channels={channels} />
}