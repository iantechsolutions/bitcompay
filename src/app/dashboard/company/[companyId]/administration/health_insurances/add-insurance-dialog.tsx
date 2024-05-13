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
import InsurancesForm from "~/components/insurances-form";
export default function AddInsuranceDialog() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="btn btn-primary">
            <PlusCircle /> Agregar Obra social
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Obra social de negocio</DialogTitle>
          </DialogHeader>
          <InsurancesForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
