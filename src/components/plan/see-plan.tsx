"use client";
import ViewIcon from "../icons/view-stroke-rounded";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
export default function SeeButton(props: { id: string }) {
  const router = useRouter();
  return (
    <div>
      <Button
        variant="bitcompay"
        className="text-[#3e3e3e] bg-stone-100 hover:bg-stone-200"
        onClick={() => router.push(`/management/sales/plans/${props.id}`)}>
        <ViewIcon className="mr-2" /> Ver
      </Button>
    </div>
  );
}
