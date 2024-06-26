"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function GoBackArrow() {
  const router = useRouter();
  return (
    <Button
      variant="link"
      className="h-auto flex justify-between pl-0 pb-10"
      onClick={() => router.back()}
    >
      <ArrowLeftIcon /> Volver
    </Button>
  );
}
