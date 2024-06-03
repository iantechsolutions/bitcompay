import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

const ContentTable: React.FC = () => {
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell colSpan={4}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> campo1 </TableHead>
              <TableHead> campo2 </TableHead>
              <TableHead> campo3 </TableHead>
              <TableHead> campo4 </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
              <TableCell>Cell 3</TableCell>
              <TableCell>Cell 4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableCell>
    </TableRow>
  );
};

export default ContentTable;
