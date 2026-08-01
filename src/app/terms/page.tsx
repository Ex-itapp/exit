import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen font-sans bg-bg text-ink p-4 sm:p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/landing" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-ink bg-white font-mono text-xs uppercase font-bold hover:bg-ink hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white border-4 border-ink p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)] space-y-8">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tighter mb-2">Terms & Conditions</h1>
            <p className="font-mono text-sm opacity-70">Last Updated: August 2025</p>
          </div>

          <div className="space-y-6 font-sans text-base leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the EX-it. application, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you do not have permission to access the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">2. Description of Service</h2>
              <p>
                EX-it. provides tools for emotional recovery and personal journaling following a breakup. This includes features like streak tracking, private unsent messaging, a red flag tracker, and AI-assisted companion features.
              </p>
              <p className="font-bold border-l-4 border-accent pl-4 py-2 bg-accent/10">
                Disclaimer: EX-it. is not a replacement for professional medical or psychiatric advice, therapy, or counseling. If you are experiencing a crisis, please contact emergency services or a crisis hotline in your area.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">4. User Content</h2>
              <p>
                You retain all rights to any diary entries, messages, or other content you submit to the Service. By posting Content, you grant us the right to store and process it solely for the purpose of providing the Service to you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">5. Subscriptions and Payments</h2>
              <p>
                Certain features of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-2xl uppercase tracking-tight text-brand">6. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="space-y-3 pt-6 border-t-2 border-ink">
              <p className="font-mono text-sm opacity-80">
                If you have any questions about these Terms, please contact us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
