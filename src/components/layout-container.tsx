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
        `space-y-5 overflow-visible ml-9 bg-white rounded-3xl p-7`,
        className
      )}
    >
      {children}
    </div>
  );
}
