"use client"
import { Button } from "~/components/ui/button";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
export default function DeleteButton(props: { id: string }) {
  const deletePlan = async () => {
    // borrar plan con id
  };
  return <Button 
  variant="bitcompay"
   className="text-[#3e3e3e] bg-stone-100 hover:bg-stone-200"
  onClick={deletePlan}><Delete02Icon className="mr-2"/> Eliminar</Button>;
}
