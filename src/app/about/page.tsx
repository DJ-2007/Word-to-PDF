import React from 'react';
import Link from 'next/link';
import { FileCode2, Users, Target, Shield, Heart, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — Convertly Universal Platform',
  description: 'Learn about Convertly, our mission to build fast, private, and accessible file conversion tools.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-200 dark:border-indigo-800">
          <Target className="w-3.5 h-3.5" />
          <span>Our Mission</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          File conversion made simple
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Convertly was built to eliminate the clunky software, spammy ads, and privacy risks common across traditional online file converters.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Why We Built Convertly</h2>
        <p>
          Converting a Word document to a PDF or an image to a different format shouldn&apos;t require installing expensive office suites, giving away your email address, or worrying about whether an unknown website is storing or training models on your confidential files.
        </p>
        <p>
          We engineered Convertly from the ground up using modern open-source conversion libraries, isolated execution sandboxes, and a strict 24-hour automatic deletion policy.
        </p>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 not-prose">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">1. Privacy First</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero model training, zero data resale. Your files belong exclusively to you.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">2. Honest Quality</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We never fake progress or download URLs. Real open-source engines deliver real results.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">3. Accessible</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Free to use, mobile-ready, screen-reader friendly, with zero unnecessary hurdles.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Ready to convert your files?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Choose from over 20+ conversion tools ready to use immediately.
        </p>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
        >
          View Tools Directory
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
