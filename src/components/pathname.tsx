import { Breadcrumb } from "./ui/breadcrumb";
import { usePathname } from "next/navigation";
export default function PathName() {
  const pathname = usePathname();
  // https://nextjs.org/docs/app/api-reference/functions/use-pathname <- read pathname documentation here
  // https://ui.shadcn.com/docs/components/breadcrumb <- read bradcrumb documentation here
  return <Breadcrumb></Breadcrumb>;
}
