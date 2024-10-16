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
        `space-y-[2vh] overflow-hidden bg-white rounded-3xl py-[3vh] px-[3vw] mt-[16vh] mx-[3vw] md:ml-[21vw] 2xl:ml-80 2xl:mr-16`,
        className
      )}>
      <div>
      <BreadcrumbComp pageName={pageName}/>
      </div>
      {children}
    </div>
    
  );
}
