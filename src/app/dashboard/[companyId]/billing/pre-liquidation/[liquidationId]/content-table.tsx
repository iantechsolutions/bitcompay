import React from "react";
import { TableCell } from "~/components/ui/table";

const ContentTable: React.FC = () => {
  return (
    <div>
      <TableCell>Cell 1</TableCell>
      <TableCell>Cell 2</TableCell>
      <TableCell>Cell 3</TableCell>
      <TableCell>Cell 4</TableCell>
    </div>
  );
};

export default ContentTable;
