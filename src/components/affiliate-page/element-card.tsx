import React from "react";

type ElementCardProps = {
  element: {
    key: string;
    value: React.ReactNode | string | number | null | undefined;
  };
  children?: React.ReactNode;
};

export default function ElementCard(props: ElementCardProps) {
  let content: React.ReactNode = (
    <div className="font-medium text-[#3E3E3E] text-sm pl-2">
      {props.element.value ?? "-"}
    </div>
  );

  if (props.children) {
    content = props.children;
  }
  return (
    <div className="flex flex-col pl-0 pr-4 py-2 border-b-2  text-[#747474] text-sm ">
      <p>{props.element.key}</p>
      {content}
    </div>
  );
}
