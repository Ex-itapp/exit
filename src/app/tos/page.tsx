"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TosPage() {
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
            <span className="bg-brand text-ink font-mono text-xs font-bold uppercase px-3 py-1 border-2 border-ink">
              Legal
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading tracking-tighter uppercase font-black">
              Terms of Service
            </h1>
            <p className="font-mono text-xs text-ink/60 font-bold uppercase tracking-widest">
              Last updated: July 28, 2026
            </p>
          </div>

          <div className="space-y-6 font-sans text-sm sm:text-base text-ink/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">1. Acceptance of Terms</h2>
              <p>By accessing or using EX-it. ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">2. Description of Service</h2>
              <p>EX-it. is a digital breakup recovery sanctuary that provides AI-powered companionship, journaling tools, and emotional support resources. The Service is for personal, non-commercial use only and is not a substitute for professional medical or mental health care.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">3. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years old to use the Service. You agree to provide accurate information and update it as needed.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">4. Privacy</h2>
              <p>Your privacy is important to us. Our collection and use of your data is governed by our Privacy Policy, which is incorporated into these Terms.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">5. No Medical Advice</h2>
              <p>EX-it. is not a licensed medical, therapeutic, or psychological service. The AI companion and all content provided are for informational and emotional support purposes only. If you are in crisis, please contact a licensed professional or emergency services immediately.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">6. Subscriptions & Payments</h2>
              <p>Premium features require a paid subscription. Fees are billed in advance on a monthly or annual basis as selected. You may cancel at any time. Refunds are handled in accordance with our 7-day money-back guarantee for new subscriptions.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">7. Acceptable Use</h2>
              <p>You agree not to misuse the Service, including attempting to access it via automated means, transmitting harmful code, or using it for any unlawful purpose. We reserve the right to terminate accounts that violate these terms.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">8. Limitation of Liability</h2>
              <p>EX-it. and its operators shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. The Service is provided "as is" without warranties of any kind.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">9. Changes to Terms</h2>
              <p>We may modify these Terms at any time. Material changes will be notified via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.</p>
            </section>

            <section className="space-y-2">
              <h2 className="font-heading text-xl uppercase tracking-tight font-black">10. Contact</h2>
              <p>For questions about these Terms, please contact us through our Support page.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
