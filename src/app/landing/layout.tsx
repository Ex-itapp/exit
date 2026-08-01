import type { Metadata } from "next";
import "../../index.css";

export const metadata: Metadata = {
  title: "EX-it. — Your Breakup Recovery Space",
  description: "Heal from heartbreak through no-contact streak tracking, unsent messages, and a private diary.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-brand selection:text-ink">
      {children}
    </div>
  );
}
