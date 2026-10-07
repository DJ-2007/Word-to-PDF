import React from 'react';
import { ShieldCheck, Lock, Trash2, Server, EyeOff, FileCheck2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Architecture & Data Privacy',
  description: 'How Convertly protects your files with isolated sandboxes, TLS 1.3 encryption, and 24-hour automatic data wiping.',
};

export default function SecurityPage() {
  const securityPillars = [
    {
      icon: Lock,
      title: 'TLS 1.3 Transport Security',
      desc: 'All communications between your browser and our servers use modern TLS 1.3 with high-grade AES-256-GCM cipher suites, preventing interception and eavesdropping.',
    },
    {
      icon: Trash2,
      title: 'Automated 24-Hour File Purging',
      desc: 'Every file uploaded and its converted output are tagged with an immutable expiry timestamp. Our automated daemon permanently deletes temporary files within 24 hours.',
    },
    {
      icon: EyeOff,
      title: 'Zero File Inspection & AI Training',
      desc: 'We never parse, analyze, or feed uploaded documents into machine learning models. Your content remains completely private and confidential.',
    },
    {
      icon: Server,
      title: 'Randomized UUID Storage Isolation',
      desc: 'Files are never saved under their original user filenames. Internal storage utilizes randomized cryptographically secure UUIDv4 namespaces with zero cross-job linkage.',
    },
    {
      icon: FileCheck2,
      title: 'Header & Magic Byte Sanitization',
      desc: 'Uploads are strictly inspected against known file format signatures (magic bytes) to reject executable payloads, script injections, and directory traversal attempts.',
    },
    {
      icon: ShieldCheck,
      title: 'Immediate Manual Deletion',
      desc: 'You maintain complete control: as soon as your conversion finishes, you can press "Delete file now" to trigger immediate file purging from disk.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Factual Security Documentation</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Built for confidentiality
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          We treat every uploaded document as sensitive and untrusted. Here is an honest, technical explanation of how our architecture protects your privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {securityPillars.map((pillar, i) => (
          <div
            key={i}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <pillar.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Honest Claims Table */}
      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Our Honest Transparency Standard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Unlike many conversion websites that make exaggerated claims like &ldquo;100% military encryption&rdquo;, we prefer clear, verifiable facts:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">How It Works</th>
                <th className="py-3 px-4">Our Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-semibold">File Retention</td>
                <td className="py-3.5 px-4">Local disk storage during processing</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Deleted automatically within 24 hours</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold">Data Access</td>
                <td className="py-3.5 px-4">Automated conversion worker subprocesses</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">No human or third-party ever views file contents</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold">Tracking & Analytics</td>
                <td className="py-3.5 px-4">Basic anonymous conversion count metrics</td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">No behavioral tracking pixels or profiling cookies</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
        >
          Try Secure Conversion
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
