"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function RedirectButton(props: {
  children: React.ReactNode;
  url: string;
}) {
  const router = useRouter();
  return (
    <Button
      className="mr-2"
      variant="link"
      onClick={() => router.push(props.url)}
    >
      {props.children}
    </Button>
  );
}
