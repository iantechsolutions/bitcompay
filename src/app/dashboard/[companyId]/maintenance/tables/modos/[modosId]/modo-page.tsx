"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
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
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useCompanyData } from "../../../company-provider";
import { type RouterOutputs } from "~/trpc/shared";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import { Card } from "~/components/ui/card";
import LayoutContainer from "~/components/layout-container";
import { modos } from "~/server/db/schema";
import { Title } from "~/components/title";
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  description: string;
};

export default function ModoPage(props: {
  modo: RouterOutputs["modos"]["get"];
}) {
  const router = useRouter();
  const company = useCompanyData();
  const initialValues: Inputs = {
    description: props.modo!.description!,
  };
  return (
    <div>
      <h1>hola</h1>
    </div>
  )
}