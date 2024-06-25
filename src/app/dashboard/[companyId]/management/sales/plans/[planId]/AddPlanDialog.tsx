"use client";
import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
// import { CalendarByMountAndYear } from "~/components/ui/calendarMonthAndYear";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { cn } from "~/lib/utils";
import { PlanSchema } from "~/server/forms/plans-schema";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCompanyData } from "~/app/dashboard/[companyId]/company-provider";
import { Checkbox } from "~/components/ui/checkbox";
import { useFieldArray } from "react-hook-form";
import { Label } from "~/components/ui/label";
import { brandsRouter } from "~/server/api/routers/brands-router";
import { RouterOutputs } from "~/trpc/shared";

export default AddPlanInfoPlan(){


    return(
  <div>

        <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-col items-center justify-center gap-2 space-y-8">
        <Tabs>
        <TabsList>
            <TabsTrigger value="info">Informacion del plan</TabsTrigger>
            <TabsTrigger value="billing">Precios</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
            <div className="">
            <FormField
                control={form.control}
                name="validy_date"
                render={({ field }) => (
                <FormItem className="flex flex-col ">
                    <FormLabel htmlFor="validy_date">
                    Fecha de vigencia
                    </FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                            !field.value && "text-muted-foreground"
                            )}>
                            <p>
                            {field.value ? (
                                dayjs
                                .utc(field.value)
                                .format("[1 de] MMMM [de] YYYY")
                            ) : (
                                <span>Seleccione una fecha</span>
                            )}
                            </p>
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0"
                        align="start">
                        {/* <CalendarByMountAndYear
                        mode="single"
                        selected={
                            field.value
                            ? new Date(field.value)
                            : new Date()
                        }
                        onSelect={field.onChange}
                        initialFocus
                        /> */}
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div>
                <Label>Marca</Label>
                <Select
                onValueChange={(value: string) => setBrand(value)}
                value={brand}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione una marca" />
                </SelectTrigger>
                <SelectContent>
                    {brands?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.description}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <FormField
                control={form.control}
                name="plan_code"
                render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="plan_code">Código</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem>
                    <FormLabel htmlFor="description">
                    Descripción
                    </FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>
        </TabsContent>
        </Tabs>
        <Button type="submit">{planId ? "Actualizar" : "Guardar"}</Button>
      </form>
  </div>
)}
function AddPlanInfoPlan() {
    throw new Error("Function not implemented.");
}

