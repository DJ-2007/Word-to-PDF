import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Transparent File Handling',
  description: 'Convertly privacy policy outlining our strict no-tracking, no-retention, and isolated sandbox data practices.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-6">
        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Overview</h2>
          <p>
            At Convertly, your privacy is our primary engineering requirement. We do not sell user data, we do not require account creation for document conversions, and we never use uploaded content to train machine learning models.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. File Retention & Deletion</h2>
          <p>
            When you upload a file for conversion:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The file is assigned a randomized UUID identifier.</li>
            <li>It is saved into an isolated temporary workspace directory.</li>
            <li>Conversion is performed locally by sandboxed conversion processes.</li>
            <li>Both original and converted files are automatically wiped after 24 hours.</li>
            <li>Users can delete their files immediately using the &ldquo;Delete file now&rdquo; control.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Information We Collect</h2>
          <p>
            We collect minimal technical log data required to maintain service availability, such as HTTP response codes, processing duration, file size, and anonymized conversion error codes. We do not inspect document text or extract metadata.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Cookies and Local Storage</h2>
          <p>
            Convertly uses browser localStorage strictly to store your chosen visual theme preference (light, dark, or system). We do not deploy third-party advertising or cross-site tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">5. Contact</h2>
          <p>
            For any privacy inquiries or security notices, please visit our <a href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
