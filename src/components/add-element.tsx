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
        <PlusCircleIcon className="mr-2" size={20} />
      )}
      {children}
    </Button>
  );
}
