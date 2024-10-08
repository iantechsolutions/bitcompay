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
    <div className={cn("flex font-medium whitespace-nowrap text-[#3E3E3E] text-[0.8rem] pl-[0.9rem]", props.contentClassName)}>
      {!props.element.value ? "-" : props.element.value}
    </div>
  );
  
  if (props.element.value === "Activo") {
   content = ( <ActiveBadge className="w-20"> Activo </ActiveBadge>)
  } 

  if (props.children) {
    content = props.children;
  }
  return (
    <div className={cn("flex flex-col justify-stretch gap-2 p-2 pl-0 pb-1 border-b-2 text-[#747474] text-sm",props.className)}>
      <p className={cn("flex uppercase whitespace-nowrap opacity-90 text-[0.875rem]",props.keyClassName)}>{props.element.key}</p>
      {content}
    </div>
  );
}
