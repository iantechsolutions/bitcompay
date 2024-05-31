import LayoutContainer from "~/components/layout-container";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import TableRowContainer from "./table-row";

export default function Home() {
  return (
    <LayoutContainer>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        <p className="opacity-70">
          <span className="font-bold opacity-100">Razon social: </span>
          Consult-Rent-SRL
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Periodo: </span>
          mm/aaaa
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Hora: </span>
          hh:mm:ss
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">CUIT </span>
          Consult-Rent-SRL
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Nro. Pre-liq: </span>
          ###
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Gerenciador: </span>
          RAS
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">PDV: </span>
          00009
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Fecha: </span>
          ###
        </p>
        <p className="opacity-70">
          <span className="font-bold opacity-100">Usuario: </span>
          Juan Hernandez
        </p>
      </div>
      <div>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4}>
                <TableRowContainer />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </LayoutContainer>
  );
}
