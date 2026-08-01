"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-brand selection:text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 h-10 bg-white border-2 border-ink brutalist-shadow-sm hover:bg-ink hover:text-bg transition-colors font-mono text-xs font-bold uppercase mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="border-4 border-ink bg-white p-6 sm:p-10 brutalist-shadow space-y-8">
          <div className="border-b-4 border-ink pb-6 space-y-2">
            <span className="bg-accent text-bg font-mono text-xs font-bold uppercase px-3 py-1 border-2 border-ink">
              Privacy
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading tracking-tighter uppercase font-black">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-ink/60 font-bold uppercase tracking-widest">
              Last updated: July 28, 2026
            </p>
          </div>

          <div className="space-y-6 font-sans text-sm sm:text-base text-ink/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">1. Information We Collect</h2>
              <p>We collect information you provide directly, including account details (email), journal entries, red flags, check-in responses, and AI conversation data. We also collect basic usage analytics to improve the Service.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">2. How We Use Your Data</h2>
              <p>Your data is used solely to operate and improve EX-it., including personalizing AI responses, tracking your recovery progress, and providing customer support. We do not sell your personal information to third parties.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">3. Data Storage & Security</h2>
              <p>Your data is encrypted in transit and at rest using industry-standard protocols. We use Supabase as our database provider. While we take reasonable measures to protect your data, no online service is completely secure.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">4. AI Conversations</h2>
              <p>Your conversations with the AI companion are private and stored securely. We use third-party AI providers (Google Gemini) to process conversations. These providers do not use your data for training their models.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">5. Third-Party Services</h2>
              <p>EX-it. integrates with Supabase (database & auth), Google Gemini AI (AI processing), and Dodo Payments (billing). Each service has its own privacy policy governing data handling.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">6. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time. You can export or delete your data through your account settings or by contacting us directly.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">7. Cookies</h2>
              <p>We use essential cookies for authentication and session management. No tracking cookies or third-party advertising cookies are used.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">8. Children's Privacy</h2>
              <p>EX-it. is not intended for children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us to have it removed.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or through the Service.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">10. Contact</h2>
              <p>For privacy-related inquiries, please reach out through our Support page.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
