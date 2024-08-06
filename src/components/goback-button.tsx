"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoBackButton(props: { url: string }) {
  const router = useRouter();
  return (
    <div
      className="opacity-50 flex flex-row items-center hover:cursor-pointer hover:underline transition-all duration-300"
      onClick={() => {
        console.log("url", props.url);
        router.push(props.url);
      }}
    >
      {" "}
      <ChevronLeft className="mr-1 h-4 w-auto" />
      <p className="font-medium ">VOLVER</p>
    </div>
  );
}
