import React from 'react';
import Link from 'next/link';
import { FileCode2, Shield, Heart, Github, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileCode2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">Convertly</span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
              Fast, privacy-first universal file conversion platform. All uploaded files are strictly encrypted in transit and automatically deleted within 24 hours.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>TLS 1.3 In-transit Encryption & Auto-deletion</span>
            </div>
          </div>

          {/* Popular Converters */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Popular Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tools/word-to-pdf" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Word to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-word" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link href="/tools/jpg-to-pdf" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-to-jpg" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  PDF to JPG
                </Link>
              </li>
              <li>
                <Link href="/tools/merge-pdf" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Merge PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tools" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  All 20+ Converters
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Guides & Tutorials
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  System Health & Status
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Support & Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/security" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Convertly Inc. All rights reserved. Open-source conversion engines.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> for speed and privacy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
