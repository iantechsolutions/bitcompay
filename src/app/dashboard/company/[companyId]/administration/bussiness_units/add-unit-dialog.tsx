"use client";
import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useCompanyData } from "../../company-provider";
import UnitsForm from "~/components/units-form";

export default function AddUnitDialog() {
  const company = useCompanyData();
  const companyId = company?.id;
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="btn btn-primary">
            <PlusCircle /> Agregar unidad
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar unidad de negocio</DialogTitle>
          </DialogHeader>
          <UnitsForm companyId={companyId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
