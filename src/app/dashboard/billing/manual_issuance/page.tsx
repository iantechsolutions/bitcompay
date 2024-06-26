'use server'
import fs from 'node:fs'
import LayoutContainer from '~/components/layout-container'
import { List, ListTile } from '~/components/list'
import { Title } from '~/components/title'
import { api } from '~/trpc/server'
import { FacturaDialog } from './generarFactura'

function formatDate(date: Date | null) {
    if (date) {
        return `${date.getFullYear()}/${date.getMonth()}/${date.getDay()}`
    }
    return ''
}

export default async function Home() {
  // const html = fs.readFileSync(
  //   "src/app/dashboard/admin/factura/bill.html",
  //   "utf8",
  // );
  const products = await api.facturas.list.query();
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Facturas</Title>
          <FacturaDialog></FacturaDialog>
        </div>
        <List>
          {products.map((product) => {
            return (
              <ListTile
                key={product.id}
                leading={"Nro: " + product.nroFactura + ","}
                title={" Emitida el: " + formatDate(product.generated)}
              />
            );
          })}
        </List>
      </section>
    </LayoutContainer>
  );
}
