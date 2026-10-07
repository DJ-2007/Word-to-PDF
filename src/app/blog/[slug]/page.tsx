import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';

interface BlogPostProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: `${post.title} — Convertly Blog`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostProps) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-8">
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Guides</span>
        </Link>

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
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
          {post.excerpt}
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Understanding Document Structure</h2>
        <p>
          Unlike plain text files, formatted documents like PDF and Word rely on complex coordinate layout grids. A PDF stores words at exact physical positions (X and Y coordinates on a sheet), whereas Word files format content into flowing semantic paragraphs, runs, inline shapes, and table rows.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Why Paragraph Reconstruction Matters</h2>
        <p>
          When converting from PDF back into Word (DOCX), a naive extractor will simply place each line into its own separate line break, ruining editing capabilities. High-fidelity engines like Convertly inspect line spacing, font metrics, and column boundaries to rebuild genuine paragraph blocks and editable tabular cells.
        </p>

        <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 my-6 not-prose">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1">
            Try it yourself with Convertly
          </h3>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-4">
            Upload your PDF and get an editable, formatted Word document in seconds.
          </p>
          <Link
            href="/tools/pdf-to-word"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors"
          >
            Launch PDF to Word Tool
          </Link>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">Summary Tips</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Ensure PDFs are not password-protected before uploading.</li>
          <li>For scanned documents without embedded text layers, OCR reconstruction ensures editable text.</li>
          <li>Always verify table headers and cell borders in complex financial statements.</li>
        </ul>
      </div>
    </article>
  );
}
