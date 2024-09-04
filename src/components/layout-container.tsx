import { cn } from "~/lib/utils";
import BreadcrumbComp from "./breadcrumb";
interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}
export default function LayoutContainer({
  children,
  className,
}: LayoutContainerProps) {
  
  return (
    <div
      className={cn(
        `space-y-[2vh] overflow-visible bg-white rounded-3xl py-[3vh] px-[3vw] mt-[16vh] mr-[3vw] ml-[3vw] md:ml-[23vw] sm:ml-[3vw] `,
        className
      )}>
      <div>
      <BreadcrumbComp />
      </div>
      {children}
    </div>
    
  );
}
