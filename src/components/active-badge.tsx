import React from "react";

export default function ActiveBadge(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-bold bg-[#DDF9CC] text-[#4E9F1D] ${props.className}`}
    >
      {props.children}
    </div>
  );
}
