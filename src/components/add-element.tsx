import Edit02Icon from "./icons/edit-02-stroke-rounded";
import { Button } from "./ui/button";
import { Loader2, PlusCircleIcon } from "lucide-react";
interface AddElementButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}
export default function AddElementButton({
  children,
  isLoading,
  onClick,
}: AddElementButtonProps) {
  return (
    <Button
      className="bg-[#bef0bb] hover:bg-[#bef0bb] text-[#3E3E3E] rounded-full"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 animate-spin" />
      ) : (
        <Edit02Icon className="h-3" />
      )}
      {children}
    </Button>
  );
}
