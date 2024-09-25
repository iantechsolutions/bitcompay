import { cn } from "~/lib/utils";

type GeneralCardProps = {
    cardClassName?:string;
    containerClassName?:string;
    children: React.ReactNode;
    title: string;
};
export default function GeneralCard({children, title, cardClassName, containerClassName}: GeneralCardProps) {
    return (
        <div className={cn("border rounded-lg px-4 pt-5 pb-8",cardClassName)}>
        <p className="text-lg font-semibold">{title}</p>
        <div className={cn("gap-4 mt-4", containerClassName)}>
            {children}
        </div>
      </div>
    )
}