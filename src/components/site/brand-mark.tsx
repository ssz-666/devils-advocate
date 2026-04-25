import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-9 place-items-center border border-devil-line bg-devil-bg-soft/70 text-devil-gold shadow-[0_0_28px_rgba(139,0,0,0.22)]">
        <Scale className="size-4 rotate-180" strokeWidth={1.5} />
      </span>
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-devil-ivory">
        反方辩友
      </span>
    </div>
  );
}
