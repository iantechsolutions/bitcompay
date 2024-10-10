import React from "react";

export default function ActiveBadge(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full mx-auto px-4 text-xs justify-center font-[550] bg-[#DDF9CC] text-[#4E9F1D] ${props.className}`}
    >
      {props.children}
    </div>
  );
}
