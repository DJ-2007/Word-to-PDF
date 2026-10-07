import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing Plans — Transparent & Accessible',
  description: 'Choose the right plan for your file conversion needs. Free tier available with no registration required.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Ideal for everyday personal document conversions.',
      badge: 'Current Plan',
      features: [
        'Up to 50 MB per file',
        '20+ conversion formats',
        'Batch conversion up to 20 files',
        '24-hour file auto-deletion',
        'Standard processing queue',
        'No account required',
      ],
      ctaText: 'Use Free Tools',
      ctaHref: '/tools',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For power users and professionals handling heavy documents.',
      badge: 'Most Popular',
      features: [
        'Up to 1 GB per file',
        'Unlimited daily conversions',
        'Priority high-speed queue',
        'Advanced batch processing (100 files)',
        'Optical Character Recognition (OCR)',
        'Direct cloud storage export',
        'Priority email support',
      ],
      ctaText: 'Upgrade to Pro (Coming Soon)',
      ctaHref: '#stripe-notice',
      highlighted: true,
      pendingIntegration: true,
    },
    {
      name: 'Team & API',
      price: '$29',
      period: '/month',
      description: 'Automate conversions with scalable REST APIs and webhooks.',
      badge: 'Enterprise',
      features: [
        'Unlimited team members',
        'Dedicated conversion worker nodes',
        '100,000 API conversions / month',
        'Custom webhook notifications',
        'Custom file retention policies (1 hr - 30 days)',
        '99.9% Uptime SLA',
      ],
      ctaText: 'Contact Sales',
      ctaHref: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Honest Pricing</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Convert without limits
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
          Start for free today. Upgrade whenever you need higher file size limits or developer API access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-200 relative ${
              plan.highlighted
                ? 'bg-gradient-to-b from-indigo-900/10 via-white dark:via-slate-900 to-white dark:to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {plan.name}
                </span>
                {plan.badge && (
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm text-slate-400 font-medium">{plan.period}</span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{plan.description}</p>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Link
                href={plan.ctaHref}
                className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
                  plan.highlighted
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {plan.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div id="stripe-notice" className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Payment processing gateway is currently configured in test mode. All current free conversions remain 100% accessible to everyone without entering payment credentials.
        </p>
      </div>
    </div>
  );
}
