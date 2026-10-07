import React from 'react';
import Link from 'next/link';
import {
  FileCode2,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  Sparkles,
  HelpCircle,
  Clock,
  Smartphone,
} from 'lucide-react';
import { CONVERSION_TOOLS, getToolBySlug } from '@/lib/format-registry';
import { ToolCard } from '@/components/ToolCard';
import { UniversalConverter } from '@/components/UniversalConverter';

export default function HomePage() {
  const popularTools = CONVERSION_TOOLS.filter((t) => t.popular).slice(0, 8);
  const heroTool = getToolBySlug('word-to-pdf') || CONVERSION_TOOLS[0];

  const faqs = [
    {
      q: 'Is the file converter completely free?',
      a: 'Yes, Convertly is free to use for files up to 50 MB with no registration, credit card, or hidden watermark required.',
    },
    {
      q: 'Are my files and sensitive documents secure?',
      a: 'All files are uploaded through encrypted TLS 1.3 connections, processed inside isolated execution environments, and never read, scanned, or used for AI training.',
    },
    {
      q: 'How long are uploaded files retained on your servers?',
      a: 'Files are permanently deleted automatically after 24 hours. You can also click "Delete file now" right on the download screen to delete them immediately.',
    },
    {
      q: 'What file formats are supported?',
      a: 'We support over 20+ conversion directions including PDF, DOCX, DOC, XLSX, XLS, PPTX, JPG, PNG, WebP, AVIF, CSV, TXT, HTML, and Markdown.',
    },
    {
      q: 'Can I convert multiple files or combine them into one PDF?',
      a: 'Yes! Our Image to PDF and Merge PDF tools support uploading multiple files at once, reordering them, and combining them into a single PDF.',
    },
    {
      q: 'Can I use Convertly on my smartphone or tablet?',
      a: 'Yes, Convertly is fully responsive and touch-optimized. You can convert files right from iOS Safari, Android Chrome, and all modern mobile browsers.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Universal 20+ Format Conversion Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl mx-auto leading-[1.15]">
          Convert Files. <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-400 bg-clip-text text-transparent">Simple. Fast. Secure.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Convert documents, images, PDFs, spreadsheets, and presentations in seconds. Zero watermarks, private, and fully automated.
        </p>

        {/* Quick actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
          >
            Explore All Tools
          </Link>
          <a
            href="#converter-interactive"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Quick Convert Below
          </a>
        </div>

        {/* Interactive Converter in Hero */}
        <div id="converter-interactive" className="mt-14 scroll-mt-24">
          <UniversalConverter tool={heroTool} />
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Popular Converters
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select the tool you need from our most frequently used utilities.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View all 20+ tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-100/60 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              How Convertly Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Three seamless steps to convert any document or photo without software installation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Upload Files</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Drag and drop your file or choose from your phone, laptop, or tablet. We validate headers and ensure safe processing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Automated Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our high-speed conversion pipeline preserves typography, margins, layouts, and image resolution with precision.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Instant Download</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download your converted document right away. All temporary files are permanently wiped after 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust Assurances */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy & Security Guarantee</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Your files belong to you. Always.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              We never read, harvest, or sell your documents. Files are stored with cryptographic UUID identifiers in isolated directories and deleted immediately upon request or automatically after 24 hours.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>TLS 1.3 Transport Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>24-Hour Auto Cleanup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>No Account Required</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/security"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Read Full Security Architecture
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Clear, honest answers about conversion limits, security, and formats.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                {faq.q}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-12 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Start Converting Your Files Today
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-6">
            Join thousands of users converting PDFs, images, and office documents effortlessly.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Explore All 20+ Converters
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
