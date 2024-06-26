// "use client";
// import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "~/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "~/components/ui/dialog";
// import dayjs from "dayjs";
// import "dayjs/locale/es";
// import utc from "dayjs/plugin/utc";
// // import { CalendarByMountAndYear } from "~/components/ui/calendarMonthAndYear";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "~/components/ui/popover";
// import { Input } from "~/components/ui/input";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import { Button } from "~/components/ui/button";
// import { useForm, type SubmitHandler } from "react-hook-form";
// import { cn } from "~/lib/utils";
// import { PlanSchema } from "~/server/forms/plans-schema";
// import { asTRPCError } from "~/lib/errors";
// import { api } from "~/trpc/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { useCompanyData } from "~/app/dashboard/[companyId]/company-provider";
// import { Checkbox } from "~/components/ui/checkbox";
// import { useFieldArray } from "react-hook-form";
// import { Label } from "~/components/ui/label";
// import { brandsRouter } from "~/server/api/routers/brands-router";
// import { RouterOutputs } from "~/trpc/shared";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// export default function AddPlanInfoPlan() {
//   const company = useCompanyData();
//   const [brand, setBrand] = useState("");
//   const [codigo, setCodigo] = useState("");
//   const [descripcion, setDescripcion] = useState("");
//   const [hasQueried, setHasQueried] = useState(false);

//   const { data: planData } = api.plans.get.useQuery(
//     { planId: planId }
//     // {
//     //   enabled: !!planId && !hasQueried,
//     //   onSuccess: () => {
//     //     setHasQueried(true);
//     //   },
//     // }
//   );

//   useEffect(() => {
//     if (planData) {
//       setBrand(planData.brand_id ?? "");
//       setCodigo(planData.plan_code);
//       setDescripcion(planData.description);
//     }
//   }, [planData]);

//   const { data: brands } = api.brands.getbyCompany.useQuery({
//     companyId: company.id,
//   });
//   const { mutateAsync: createPlan } = api.plans.create.useMutation();
//   const { mutateAsync: updatePlan } = api.plans.change.useMutation();

//   async function handleSumbit() {
//     if (planId) {
//       const plan = await updatePlan({
//         planId: planId,
//         brand_id: brand,
//         plan_code: codigo,
//         description: descripcion,
//       });
//     } else {
//       const plan = await createPlan({
//         brand_id: brand,
//         plan_code: codigo,
//         description: descripcion,
//       });
//     }
//   }

//   return (
//     <div>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="flex-col items-center justify-center gap-2 space-y-8">
//         <Tabs>
//           <TabsList>
//             <TabsTrigger value="info">Informacion del plan</TabsTrigger>
//             <TabsTrigger value="billing">Precios</TabsTrigger>
//           </TabsList>
//           <TabsContent value="info">
//             <div className="">
//               <FormField
//                 control={form.control}
//                 name="validy_date"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col ">
//                     <FormLabel htmlFor="validy_date">Mes de vigencia</FormLabel>
//                     <Select
//                       onValueChange={(e) => setMes(Number(e))}
//                       defaultValue={mes.toString()}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccione un mes" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="1">Enero</SelectItem>
//                         <SelectItem value="2">Febrero</SelectItem>
//                         <SelectItem value="3">Marzo</SelectItem>
//                         <SelectItem value="4">Abril</SelectItem>
//                         <SelectItem value="5">Mayo</SelectItem>
//                         <SelectItem value="6">Junio</SelectItem>
//                         <SelectItem value="7">Julio</SelectItem>
//                         <SelectItem value="8">Agosto</SelectItem>
//                         <SelectItem value="9">Septiembre</SelectItem>
//                         <SelectItem value="10">Octubre</SelectItem>
//                         <SelectItem value="11">Noviembre</SelectItem>
//                         <SelectItem value="12">Diciembre</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </FormItem>
//                 )}
//               />
//               <div>
//                 <Label>Marca</Label>
//                 <Select
//                   onValueChange={(value: string) => setBrand(value)}
//                   value={brand}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Seleccione una marca" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {brands?.map((item) => (
//                       <SelectItem key={item.id} value={item.id}>
//                         {item.description}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <FormField
//                 control={form.control}
//                 name="plan_code"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel htmlFor="plan_code">Código</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel htmlFor="description">Descripción</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </TabsContent>
//         </Tabs>
//         <Button type="submit">{planId ? "Actualizar" : "Guardar"}</Button>
//       </form>
//     </div>
//   );
// }
