import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen font-sans bg-bg text-ink p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/landing" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-ink bg-white font-mono text-xs uppercase font-bold hover:bg-ink hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white border-4 border-ink p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] space-y-8">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tighter mb-2">Privacy Policy</h1>
            <p className="font-mono text-sm opacity-70">Last Updated: August 2025</p>
          </div>

          <div className="space-y-6 font-sans text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-accent">1. Introduction</h2>
              <p>
                At EX-it. ("we," "our," or "us"), we take your privacy extremely seriously. We understand that breakup recovery is a deeply personal and vulnerable process. This Privacy Policy explains how we collect, use, and protect your personal information when you use our application.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-accent">2. Data We Collect</h2>
              <p>
                We only collect the data necessary to provide you with the EX-it. experience:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Information:</strong> If you choose to create an account, we store your authentication credentials securely via our authentication provider (Supabase).</li>
                <li><strong>User Content:</strong> Your diary entries, unsent messages, red flag logs, and anchor reasons. This data is strictly yours.</li>
                <li><strong>Usage Data:</strong> Basic interaction data to improve the application experience.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-accent">3. How We Use Your Data</h2>
              <p>
                Your data is used solely for the purpose of operating the application and providing you with recovery tools. <strong>We do not sell your personal data or user content to third parties.</strong>
              </p>
              <p>
                Conversations with the Healing Companion utilize AI models. We ensure that these models do not use your personal conversations for public training data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-accent">4. Data Security</h2>
              <p>
                We implement robust security measures to protect your data. Your private entries are stored securely in our database and are not accessible to other users or unauthorized personnel.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-accent">5. Your Rights</h2>
              <p>
                You have the right to access, modify, or permanently delete your data at any time. You can request account deletion, which will wipe all associated data from our servers.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t-2 border-ink">
              <p className="font-mono text-sm opacity-80">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
