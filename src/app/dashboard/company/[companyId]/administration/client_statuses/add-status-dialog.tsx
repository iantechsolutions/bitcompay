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
import StatusForm from "~/components/status-form";
export default function AddStatusDialog() {
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
          <StatusForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
