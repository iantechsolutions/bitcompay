// "use client";
// import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
// import { PlanSchema } from "~/server/forms/plans-schema";
// import { api } from "~/trpc/react";
// import { useCompanyData } from "../../../company-provider";
// import { useFieldArray } from "react-hook-form";
// import { Label } from "~/components/ui/label";
// import { RouterOutputs } from "~/trpc/shared";

// dayjs.extend(utc);
// dayjs.locale("es");

// type ConditionalPrice = {
//   id?: string;
//   condition: string;
//   age_from: string;
//   age_to?: string;
//   price: string;
//   isConditional: boolean;
// };

// type Inputs = {
//   id?: string;
//   plan_code: string;
//   description: string;
//   conditional_prices: ConditionalPrice[];
// };

// type AddPlanDialogProps = {
//   openExterior?: boolean;
//   setOpenExterior?: (open: boolean) => void;
//   initialPrices?: GroupedPlans[];
//   planId?: string;
// };
// type GroupedPlans = {
//   id?: string;
//   from_age: number;
//   to_age: number;
//   amount: number;
//   condition: string | null;
//   isConditional: boolean;
// };

// export default function AddPlanDialog({
//   openExterior,
//   setOpenExterior,
//   initialPrices,
//   planId,
// }: AddPlanDialogProps) {
//   const router = useRouter();
//   const company = useCompanyData();
//   const [open, setOpen] = useState(false);
//   const [brand, setBrand] = useState("");
//   const [anio, setAnio] = useState(2020);
//   const [mes, setMes] = useState(0);
//   const [condition, setCondition] = useState("");
//   const initValues: Inputs = {
//     id: "",
//     plan_code: "",
//     description: "",
//     conditional_prices: [],
//   };
//   const [formInitialValues, setFormInitialValues] =
//     useState<Inputs>(initValues);

//   const [hasQueried, setHasQueried] = useState(false);

//   const { data: planData } = api.plans.get.useQuery(
//     { planId: planId ?? "" },
//     {
//       enabled: !!planId && !hasQueried,
//       onSuccess: () => {
//         setHasQueried(true);
//       },
//     }
//   );

//   const form = useForm<Inputs>({
//     defaultValues: { ...formInitialValues },
//   });

//   const { reset } = form;

//   useEffect(() => {
//     if (planData) {
//       setAnio(planData.validy_date.getFullYear());
//       setMes(planData.validy_date.getMonth() + 1);
//       const updatedInitialValues = {
//         validy_date: dayjs.utc(planData.validy_date).toISOString(),
//         plan_code: planData.plan_code,
//         description: planData.description,
//         conditional_prices:
//           initialPrices?.map((item) => {
//             // Log the item for debugging purposes
//             console.log(item);
//             return {
//               condition: item.condition ?? "",
//               age_from: item.from_age?.toString() ?? "",
//               age_to: item.to_age?.toString() ?? "",
//               price: item.amount?.toString() ?? "",
//               isConditional: item.isConditional,
//             };
//           }) ?? [],
//       };
//       console.log(updatedInitialValues);
//       setFormInitialValues(updatedInitialValues);
//       setBrand(planData.brand_id ?? "");

//       // Reset form values
//       reset(updatedInitialValues);
//     }
//   }, [planData]);

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "conditional_prices",
//   });

//   const { data: brands } = api.brands.getbyCompany.useQuery({
//     companyId: company.id,
//   });
//   const { data: relatives } = api.relative.list.useQuery(undefined);
//   const { mutateAsync: createPlan } = api.plans.create.useMutation();
//   const { mutateAsync: updatePlan } = api.plans.change.useMutation();
//   const { mutateAsync: createPricePerCondition } =
//     api.pricePerCondition.create.useMutation();

//   function handleOpens(bool: boolean) {
//     setOpen(bool);
//     if (setOpenExterior) {
//       setOpenExterior(bool);
//     }
//   }

//   const onSubmit: SubmitHandler<Inputs> = async (data) => {
//     try {
//       const validity_date = new Date(anio, mes, 1); // First day of given month and year
//       const dataWithBrands = {
//         ...data,
//         brand_id: brand,
//         validy_date: validity_date,
//       };

//       const parsedData = PlanSchema.parse(dataWithBrands);
//       let plan: RouterOutputs["plans"]["create"];
//       if (planId) {
//         plan = await updatePlan({ planId: planId, ...parsedData });
//       } else {
//         plan = await createPlan(parsedData);
//       }

//       data.conditional_prices.map(async (item) => {
//         if (item.isConditional) {
//           await createPricePerCondition({
//             condition: condition,
//             amount: parseFloat(item.price),
//             plan_id: plan[0]!.id,
//             isAmountByAge: false,
//             validy_date: dayjs.utc(validity_date).toDate(),
//           });
//         } else {
//           await createPricePerCondition({
//             from_age: Number(item.age_from),
//             to_age: Number(item.age_to),
//             amount: parseFloat(item.price),
//             plan_id: plan[0]!.id,
//             isAmountByAge: true,
//             validy_date: dayjs.utc(validity_date).toDate(),
//           });
//         }
//       });

//       if (setOpen) {
//         setOpen(false);
//       }
//       if (setOpenExterior) {
//         setOpenExterior(false);
//       }

//       router.refresh();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       {!planId && (
//         <Button
//           onClick={() => {
//             handleOpens(true);
//           }}
//         >
//           <PlusCircleIcon className="mr-2" size={20} />
//           Agregar Plan
//         </Button>
//       )}
//       <Dialog open={open || openExterior} onOpenChange={handleOpens}>
//         <DialogContent className="md:max-w-[700px] overflow-y-scroll">
//           <DialogHeader>
//             <DialogTitle>
//               {planId ? "Actualizar plan" : "Agregar nuevo plan"}
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(onSubmit)}
//               className="flex-col items-center justify-center gap-2 space-y-8"
//             >
//               <Tabs>
//                 <TabsList>
//                   <TabsTrigger value="info">Informacion del plan</TabsTrigger>
//                   <TabsTrigger value="billing">Precios</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="info">
//                   <div className="">
//                     <FormItem className="flex flex-col ">
//                       <FormLabel htmlFor="validy_date">
//                         Mes de vigencia
//                       </FormLabel>
//                       <Select
//                         onValueChange={(e) => setMes(Number(e))}
//                         defaultValue={mes.toString()}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Seleccione un mes" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="1">Enero</SelectItem>
//                           <SelectItem value="2">Febrero</SelectItem>
//                           <SelectItem value="3">Marzo</SelectItem>
//                           <SelectItem value="4">Abril</SelectItem>
//                           <SelectItem value="5">Mayo</SelectItem>
//                           <SelectItem value="6">Junio</SelectItem>
//                           <SelectItem value="7">Julio</SelectItem>
//                           <SelectItem value="8">Agosto</SelectItem>
//                           <SelectItem value="9">Septiembre</SelectItem>
//                           <SelectItem value="10">Octubre</SelectItem>
//                           <SelectItem value="11">Noviembre</SelectItem>
//                           <SelectItem value="12">Diciembre</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </FormItem>
//                     <div>
//                       <FormItem>
//                         <FormLabel>Año de Vigencia</FormLabel>
//                         <FormControl>
//                           <Input
//                             className="border-green-300 focus-visible:ring-green-400 w-[100px]"
//                             type="number"
//                             value={anio}
//                             onChange={(e) => setAnio(Number(e.target.value))}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     </div>
//                     <div>
//                       <Label>Marca</Label>
//                       <Select
//                         onValueChange={(value: string) => setBrand(value)}
//                         value={brand}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Seleccione una marca" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {brands?.map((item) => (
//                             <SelectItem key={item.id} value={item.id}>
//                               {item.description}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <FormField
//                       control={form.control}
//                       name="plan_code"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel htmlFor="plan_code">Código</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="description"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel htmlFor="description">
//                             Descripción
//                           </FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </TabsContent>
//                 <TabsContent value="billing">
//                   <div className="mb-10">
//                     <Button
//                       type="button"
//                       className="float-right"
//                       onClick={() =>
//                         append({
//                           condition: "",
//                           age_from: "",
//                           age_to: "",
//                           price: "",
//                           isConditional: false,
//                         })
//                       }
//                     >
//                       <PlusCircle className="mr-2" size={20} />
//                       Agregar Precio por Edad
//                     </Button>
//                     {fields.length > 0 && (
//                       <h1 className="font-bold text-2xl">Condicion</h1>
//                     )}
//                   </div>
//                   {fields.map((item, index) => (
//                     <div key={item.id} className="flex space-x-4 items-center">
//                       <div className="w-[300px]">
//                         <FormField
//                           control={form.control}
//                           name={`conditional_prices.${index}.isConditional`}
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel
//                                 htmlFor={`conditional_prices.${index}.isConditional`}
//                               ></FormLabel>
//                               <br />
//                               <FormControl>
//                                 <Select
//                                   onValueChange={(value) => {
//                                     const updatedValues = [
//                                       ...formInitialValues.conditional_prices,
//                                     ];
//                                     updatedValues[index] = {
//                                       ...updatedValues[index],
//                                       isConditional: value === "true",
//                                       condition:
//                                         updatedValues[index]?.condition ?? "",
//                                       age_from:
//                                         updatedValues[index]?.age_from ?? "",
//                                       age_to:
//                                         updatedValues[index]?.age_to ?? "",
//                                       price: updatedValues[index]?.price ?? "",
//                                     };
//                                     setFormInitialValues({
//                                       ...formInitialValues,
//                                       conditional_prices: updatedValues,
//                                     });
//                                     field.onChange(value === "true");
//                                   }}
//                                   value={field.value ? "true" : "false"}
//                                 >
//                                   <SelectTrigger className="w-[150px] font-bold">
//                                     <SelectValue placeholder="Seleccione una opción" />
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     <SelectItem
//                                       value="false"
//                                       className="rounded-none border-b border-gray-600"
//                                     >
//                                       Rango de edad
//                                     </SelectItem>
//                                     <SelectItem
//                                       value="true"
//                                       className="rounded-none border-b border-gray-600"
//                                     >
//                                       Parentesco
//                                     </SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </div>
//                       {formInitialValues?.conditional_prices[index]
//                         ?.isConditional && (
//                         <FormField
//                           control={form.control}
//                           name={`conditional_prices.${index}.condition`}
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel
//                                 htmlFor={`conditional_prices.${index}.condition`}
//                               >
//                                 Relacion
//                               </FormLabel>
//                               <FormControl>
//                                 <Select
//                                   onValueChange={(value) => setCondition(value)}
//                                 >
//                                   <SelectTrigger>
//                                     <SelectValue placeholder="Seleccione una opción" />
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     {relatives?.map((relative) => (
//                                       <SelectItem
//                                         key={relative.relation}
//                                         value={relative.relation ?? ""}
//                                       >
//                                         {relative.relation}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       )}
//                       {!formInitialValues?.conditional_prices[index]
//                         ?.isConditional && (
//                         <>
//                           <FormField
//                             control={form.control}
//                             name={`conditional_prices.${index}.age_from`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel
//                                   htmlFor={`conditional_prices.${index}.age_from`}
//                                 >
//                                   Edad Desde
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     className="border-green-300 focus-visible:ring-green-400"
//                                     id={`conditional_prices.${index}.age_from`}
//                                     type="text"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <FormField
//                             control={form.control}
//                             name={`conditional_prices.${index}.age_to`}
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel
//                                   htmlFor={`conditional_prices.${index}.age_to`}
//                                 >
//                                   Edad Hasta
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     className="border-green-300 focus-visible:ring-green-400"
//                                     id={`conditional_prices.${index}.age_to`}
//                                     type="text"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                         </>
//                       )}
//                       <FormField
//                         control={form.control}
//                         name={`conditional_prices.${index}.price`}
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel
//                               htmlFor={`conditional_prices.${index}.price`}
//                             >
//                               Precio
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 className="border-green-300 focus-visible:ring-green-400 w-[100px]"
//                                 id={`conditional_prices.${index}.price`}
//                                 type="text"
//                                 {...field}
//                               />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <Button
//                         variant="ghost"
//                         type="button"
//                         className="relative top-3"
//                         onClick={() => remove(index)}
//                       >
//                         <CircleX className="text-red-500 left-0" size={20} />
//                       </Button>
//                     </div>
//                   ))}
//                 </TabsContent>
//               </Tabs>
//               <Button type="submit">{planId ? "Actualizar" : "Guardar"}</Button>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
"use client";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import AddPlanInfoComponent from "./add-planinfo-component";
import AddPlanPricesComponent from "./add-planprices-component";
import { Button } from "~/components/ui/button";
import { useState } from "react";

export default function AddPlanDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Agregar plan</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-auto h-auto">
          <AddPlanPricesComponent />
        </DialogContent>
      </Dialog>
    </div>
  );
}