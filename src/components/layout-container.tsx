import { cn } from "~/lib/utils";
interface LayoutContainerProps {
  children: React.ReactNode;
  className?: string;
}
export default function LayoutContainer({
  children,
  className,
}: LayoutContainerProps) {
  return (
    <div
      className={cn(
        `w-full max-w-[1000px] space-y-5 overflow-visible`,
        className
      )}
    >
      {children}
    </div>
  );
}
