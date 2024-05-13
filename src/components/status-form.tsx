import { useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { api } from "~/trpc/react";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
("");
import { type RouterOutputs } from "~/trpc/shared";
import { asTRPCError } from "~/lib/errors";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type Inputs = {
  description: string;
  type: string;
};

export default function StatusForm({
  status,
  setOpen,
}: {
  status?: RouterOutputs["clientStatuses"]["get"];
  setOpen?: (open: boolean) => void;
}) {
  const router = useRouter();
  const UnitSchema = z.object({
    description: z.string().min(1, { message: "El nombre es requerido" }),
    type: z.string().min(1, { message: "el tipo es requerido" }),
  });
  const form = useForm<Inputs>({
    resolver: zodResolver(UnitSchema),
    defaultValues: {
      description: status ? status.description! : "",
      type: status ? status.type! : "",
    },
  });
  const { mutateAsync: createInsurance } =
    api.clientStatuses.create.useMutation();
  const { mutateAsync: updateInsurance } =
    api.clientStatuses.change.useMutation();
  const OnSubmit: SubmitHandler<Inputs> = async (data) => {
    const parsedData = UnitSchema.parse(data);

    await createInsurance({ ...parsedData });

    if (setOpen) {
      setOpen(false);
    }
  };
  const onChange: SubmitHandler<Inputs> = async (data) => {
    try {
      const parsedData = UnitSchema.parse(data);
      await updateInsurance({
        ...parsedData,
        clientStatusId: status!.id!,
      });
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(status ? onChange : OnSubmit)}
          className="flex-col items-center justify-center gap-2 space-y-8"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description">Descripción</FormLabel>
                <FormControl>
                  <Input type="text" id="description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="type">Tipo</FormLabel>
                <FormControl>
                  <Input type="text" id="type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">
            {status ? "Guardar cambios" : "Añadir estado"}
          </Button>
        </form>
      </Form>
    </>
  );
}
