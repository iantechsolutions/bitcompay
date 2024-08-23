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
        `space-y-[2vh] overflow-visible bg-white rounded-3xl p-[3vh] mt-[19vh] md:ml-[30vw] mr-[3vw] sm:ml-[3vw]`,
        className
      )}
    >
      {children}
    </div>
  );
}
