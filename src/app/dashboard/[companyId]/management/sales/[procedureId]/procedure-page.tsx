"use client";
import { useState } from "react";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Procedure } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default async function ProcedurePage(props: { procedure: Procedure }) {
  //   const procedure = await api.procedure.get.query({ id: props.params. });+
  const [states, setStates] = useState<string[]>([
    "Confirmado",
    "Pre-Aprobado",
    "Estudiar",
    "Devuelto",
    "No Aprobado",
  ]);
  const [state, setState] = useState<string>("pendiente");
  const { mutateAsync: changeProcedureState, isLoading } =
    api.procedure.change.useMutation();
  // async function handleConfirm() {}
  async function handleConfirm() {
    changeProcedureState({ id: props.procedure.id, estado: state });
  }

  if (!props.procedure) {
    return <Title>El grupo familiar no existe.</Title>;
  }
  return (
    <div>
      <div>
        <Select
          onValueChange={(value: string) => {
            setState(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccione un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              {states.map((state) => {
                return <SelectItem value={state}>{state}</SelectItem>;
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <br></br>
      <div>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </div>
    </div>
  );
}
