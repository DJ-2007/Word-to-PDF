import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CONVERSION_TOOLS,
  getToolBySlug,
  getRelatedTools,
} from '@/lib/format-registry';
import { UniversalConverter } from '@/components/UniversalConverter';
import { ToolCard } from '@/components/ToolCard';
import { ArrowLeft, CheckCircle2, HelpCircle, Shield, FileCheck } from 'lucide-react';
import { APP_CONFIG } from '@/config';

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return CONVERSION_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: tool.title,
    description: tool.shortDescription,
    alternates: {
      canonical: `${APP_CONFIG.url}/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} Converter — ${APP_CONFIG.name}`,
      description: tool.shortDescription,
      url: `${APP_CONFIG.url}/tools/${tool.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.shortDescription,
    },
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    notFound();
  }

  const relatedTools = getRelatedTools(tool.slug, 4);

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `${APP_CONFIG.url}/tools/${tool.slug}`,
    description: tool.shortDescription,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="space-y-16 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero / Converter Section */}
      <section className="pt-10 md:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Tools</span>
          </Link>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>

        {/* Universal Converter Element */}
        <UniversalConverter tool={tool} />
      </section>

      {/* How It Works for this Tool */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-500" />
            <span>How to Use the {tool.name} Tool</span>
          </h2>

          <div className="space-y-4">
            {tool.howItWorks.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Files are encrypted with TLS 1.3 and auto-deleted after 24 hours.</span>
          </div>
        </div>
      </section>

      {/* Tool FAQs */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {tool.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Related Conversion Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.slug} tool={relTool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
