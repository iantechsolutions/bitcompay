import React from "react";

export default function ActiveBadge(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-auto rounded-full px-4 py-1 text-xs justify-center font-bold bg-[#DDF9CC] text-[#4E9F1D] ${props.className}`}
    >
      {props.children}
    </div>
  );
}
