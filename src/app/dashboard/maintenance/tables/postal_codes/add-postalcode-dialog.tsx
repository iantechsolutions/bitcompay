"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";

export function AddPostalCode() {
  const { mutateAsync: createPostalCode, isLoading } =
    api.postal_code.create.useMutation();

  const [name, setName] = useState("");
  const [cp, setCp] = useState("");
  const [zone, setZone] = useState("");

  const [open, setOpen] = useState(false);

  const router = useRouter();

  async function handleCreate() {
    try {
      await createPostalCode({
        name: name,
        cp: cp,
        zone: zone,
      });

      toast.success("Postal code created successfully");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Add Postal Code
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Postal Code</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cp">CP</Label>
            <Input
              id="cp"
              placeholder="..."
              value={cp}
              onChange={(e) => setCp(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="zone">Zone</Label>
            <Input
              id="zone"
              placeholder="..."
              value={zone}
              onChange={(e) => setZone(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button disabled={isLoading} onClick={handleCreate}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Create Postal Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
