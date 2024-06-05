import LayoutContainer from "~/components/layout-container";
// import {
//   Table,
//   TableRow,
//   TableBody,
//   TableHead,
//   TableHeader,
// } from "~/components/ui/tablePreliq";
import TableRowContainer from "./table-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";

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
        <Table className="border-separate  border-spacing-x-0 border-spacing-y-2">
          <TableHeader className="overflow-hidden">
            <TableRow className="bg-[#79edd6]">
              <TableHead className="text-gray-800 rounded-l-md border-r-[1.5px] border-[#4af0d4]">
                Nro. GF
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Nombre (Resp. Pago){" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                DNI
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                CUIL/CUIT (Resp. Pago){" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Saldo Cta. Cte.{" "}
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Cuota
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Bonificacion
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Diferencial
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Aportes
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Interes
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                Sub total
              </TableHead>
              <TableHead
                className="text-gray-800
               border-r-[1.5px] border-[#4af0d4]"
              >
                IVA
              </TableHead>
              <TableHead
                className="text-gray-800
               rounded-r-md overflow-hidden"
              >
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRowContainer />
          </TableBody>
        </Table>
        <br />
      </div>
    </LayoutContainer>
  );
}
