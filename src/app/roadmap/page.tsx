"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoadmapPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/rebuild");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-mono text-xs text-ink/60">
      Redirecting to Rebuild...
    </div>
  );
}
