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
        `space-y-[2vh] overflow-visible bg-white rounded-3xl p-[3vh] mt-[16vh] mr-[3vw] ml-[3vw] md:ml-72 lg:ml-80 xl:ml-88 2xl:ml-96 `,
        className
      )}>
      <div>
      <BreadcrumbComp />
      </div>
      {children}
    </div>
    
  );
}
