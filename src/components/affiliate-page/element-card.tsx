import { cn } from "~/lib/utils";
type ElementCardProps = {
  element: {
    key: string;
    value: React.ReactNode | string | number | null | undefined;
  };
  children?: React.ReactNode;
  className?:string;
};

export default function ElementCard(props: ElementCardProps) {
  let content: React.ReactNode = (
    <div className="font-medium text-[#3E3E3E] text-base pl-4">
      {props.element.value ?? "-"}
    </div>
  );

  if (props.children) {
    content = props.children;
  }
  return (
    <div className={cn("flex flex-col gap-1 pl-0 pr-4 pt-2 pb-1 border-b-2  text-[#747474] text-sm ",props.className)}>
      <p>{props.element.key}</p>
      {content}
    </div>
  );
}
