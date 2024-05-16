"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import ProviderForm from "~/components/provider-form";

export function AddProviderDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear Proveedor
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-scroll px-9 py-8">
          <DialogHeader className="mb-3">
            <DialogTitle>Agregar nuevo proveedor</DialogTitle>
          </DialogHeader>
          <ProviderForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}
