"use client";
import { api } from "~/trpc/react";
import { createContext, useContext, useEffect, useRef } from "react";
import { Title } from "~/components/title";
import type { RouterOutputs } from "~/trpc/shared";

const companyContext = createContext<RouterOutputs["companies"]["get"] | null>(
  null
);

export function CompanyProvider(props: {
  children: React.ReactNode;
  company: RouterOutputs["companies"]["get"] | null;
}) {
  const utils = api.useUtils();
  const ref = useRef<string>();
  useEffect(() => {
    if (ref.current != props.company?.id) {
      utils.invalidate();
      ref.current = props.company?.id;
    }
  }, [props.company?.id]);
  if (!props.company) {
    return (
      <>
        <Title>No se puede acceder a esta entidad</Title>
      </>
    );
  }

  return (
    <companyContext.Provider value={props.company}>
      {props.children}
    </companyContext.Provider>
  );
}
