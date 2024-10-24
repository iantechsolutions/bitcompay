"use client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoBackButton(props: { url: string }) {
  const router = useRouter();
  
  const handleGoBack = () => {
    if (window.history.length > 2) { 
      router.back();
    } else {
      router.push(props.url);
    }
  };

  return (
    <div
      className="opacity-60 flex flex-row items-center hover:cursor-pointer hover:underline transition-all duration-300"
      onClick={handleGoBack}
    >
      <ChevronLeft className="mr-1 mb-3 h-4 w-auto text-gray-700" />
      <p className="text-gray-700 text-sm mb-3">VOLVER</p>
    </div>
  );
}
