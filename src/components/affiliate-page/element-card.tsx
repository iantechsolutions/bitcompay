import { cn } from "~/lib/utils";
import ActiveBadge from "../active-badge";
type ElementCardProps = {
  element: {
    key: string;
    value: React.ReactNode | string | number | null | undefined;
  };
  children?: React.ReactNode;
  className?:string;
  contentClassName?:string;
  keyClassName?:string;
};

export default function ElementCard(props: ElementCardProps) {
  let content: React.ReactNode = (
    <div className={cn("flex font-medium whitespace-nowrap text-[#3E3E3E] text-base pl-4", props.contentClassName)}>
      {props.element.value ?? "-"}
    </div>
  );
  
  if (props.element.value === "Activo") {
   content = ( <ActiveBadge> Activo </ActiveBadge>)
  } 

  if (props.children) {
    content = props.children;
  }
  return (
    <div className={cn("flex flex-col justify-stretch gap-2 p-2 pl-0 pb-1 border-b-2 text-[#747474] text-sm",props.className)}>
      <p className={cn("flex uppercase whitespace-nowrap opacity-90 text-xs",props.keyClassName)}>{props.element.key}</p>
      {content}
    </div>
  );
}
