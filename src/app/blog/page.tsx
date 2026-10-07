import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog & Conversion Guides — Convertly',
  description: 'Practical guides and deep-dives into document layout preservation, image compression, and file formats.',
};

export default function BlogIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-200 dark:border-indigo-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Guides & Resources</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          File Conversion Guides
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Best practices, tutorials, and formatting advice from our engineering team.
        </p>
      </div>

      <div className="space-y-6">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {post.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
              {post.title}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {post.excerpt}
            </p>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Read article
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
