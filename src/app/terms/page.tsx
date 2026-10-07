import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Convertly',
  description: 'Terms and conditions governing the use of Convertly file conversion utilities.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-6">
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Convertly, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Acceptable Use</h2>
          <p>
            You agree not to use Convertly for any unlawful purpose, including but not limited to uploading malware, ransomware, executable exploits, copyrighted materials without authorization, or infringing files.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Intellectual Property</h2>
          <p>
            You retain 100% of all intellectual property rights to files you upload and converted outputs. Convertly claims no ownership or rights over your content.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Disclaimer of Warranties</h2>
          <p>
            Convertly is provided &ldquo;as is&rdquo; without warranties of any kind. While our conversion engines strive for maximum layout and visual fidelity, we do not guarantee that every conversion will be 100% identical to the source document.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">5. Limitation of Liability</h2>
          <p>
            In no event shall Convertly or its contributors be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this service.
          </p>
        </section>
      </div>
    </div>
  );
}
