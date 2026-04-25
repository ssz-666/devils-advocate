import { Suspense } from "react";
import { VerdictPageClient } from "@/app/trial/single/verdict/VerdictPageClient";

function VerdictPageFallback() {
  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-28 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.22),transparent_34%)]" />
      <div className="mx-auto max-w-[560px] border border-devil-gold bg-devil-bg-soft/95 px-6 py-10 shadow-[0_0_100px_rgba(139,0,0,0.14)] sm:px-[60px]">
        <div className="flex flex-col items-center">
          <div className="size-12 animate-pulse rounded-full border border-devil-gold/40" />
          <div className="mt-5 h-3 w-64 animate-pulse bg-devil-line/50" />
        </div>
        <div className="my-6 h-px bg-gradient-to-r from-transparent via-devil-gold/60 to-transparent" />
        <div className="mx-auto h-12 w-48 animate-pulse bg-devil-line/45" />
        <div className="mx-auto mt-4 h-5 w-24 animate-pulse bg-devil-line/35" />
        <div className="mt-10 flex justify-center">
          <div className="size-24 animate-spin rounded-full border border-devil-gold/30 border-t-devil-red/60" />
        </div>
        <div className="mt-10 space-y-4">
          <div className="h-5 w-4/5 animate-pulse bg-devil-line/50" />
          <div className="h-5 w-3/5 animate-pulse bg-devil-line/40" />
          <div className="h-4 w-2/3 animate-pulse bg-devil-line/30" />
        </div>
      </div>
    </section>
  );
}

export default function SingleTrialVerdictPage() {
  return (
    <Suspense fallback={<VerdictPageFallback />}>
      <VerdictPageClient />
    </Suspense>
  );
}
