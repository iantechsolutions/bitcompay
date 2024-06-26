import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";
import { AddProductDialog } from "./add-product-dialog";

export default async function Home() {
  const products = await api.products.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Productos</Title>
          <AddProductDialog />
        </div>
        <List>
          {products.map((product) => {
            return (
              <ListTile
                key={product.id}
                leading={product.number}
                href={`/dashboard/administration/products/${product.id}`}
                title={product.name}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
