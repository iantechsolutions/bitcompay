import Edit02Icon from "./icons/edit-02-stroke-rounded";
import { Button } from "./ui/button";
import { Loader2, PlusCircleIcon } from "lucide-react";
interface AddElementButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}
export default function AddElementButton({
  children,
  isLoading,
  onClick,
  className,
}: AddElementButtonProps) {
  return (
    <Button
      variant="bitcompay"
      className={className}
      onClick={onClick}
      disabled={isLoading}
    >
      {children}
    </Button>
  );
}
