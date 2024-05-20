"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type InputsMembers } from "./members-info";

type MembersTableProps = {
  data: InputsMembers[];
};
export default function MembersTable({ data }: MembersTableProps) {
  return (
    <Table>
      <TableCaption>Lista de miembros agregados </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Parentezco</TableHead>
          <TableHead className="w-[100px]">Nombre</TableHead>
          <TableHead>Numero de DNI</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 && (
          <>
            {data.map((member) => (
              <TableRow key={member.id_number}>
                <TableCell>{member.relationship}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.id_number}</TableCell>
              </TableRow>
            ))}
          </>
        )}
        {data.length === 0 && (
          <TableRow>
            <TableCell>No hay miembros agregados</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
