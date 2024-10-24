import { cn } from "~/lib/utils";
import BreadcrumbComp from "./breadcrumb";
interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
  pageName?:string;
}
export default function LayoutContainer({
  children,
  className,
  pageName
}: LayoutContainerProps) {
  
  return (
    <div
      className={cn(
        `space-y-[2vh] overflow-hidden bg-white rounded-3xl py-[3vh] px-[3vw] mt-[16vh] mx-[3vw] md:ml-[278px] md:mr-[28px] xl:mr-[32px] xl:ml-[320px]`,
        className
      )}>
      <div>
      <BreadcrumbComp pageName={pageName}/>
      </div>
      {children}
    </div>
    
  );
}
