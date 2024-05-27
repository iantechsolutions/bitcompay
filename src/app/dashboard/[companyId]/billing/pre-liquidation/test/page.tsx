"use client"
import { Title } from "~/components/title";
import LayoutContainer from "~/components/layout-container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
// import { api } from "~/trpc/react";
// const { data: marcas } = api.brands.list.useQuery(undefined);
export default async function Page(props: { params: { companyId: string } }) {
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Pre-Liquidacion</Title>
        </div>
      </section>
      <div>
        <Select>
          <SelectTrigger className="w-[180px] bg-[#1bdfb7] font-bold">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
      </div>
    </LayoutContainer>
  );
}
