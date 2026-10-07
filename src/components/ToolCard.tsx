import React from 'react';
import Link from 'next/link';
import { ConversionToolDefinition } from '@/types';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Presentation,
  Minimize2,
  FileCode,
} from 'lucide-react';

export function ToolCard({ tool }: { tool: ConversionToolDefinition }) {
  const getIcon = () => {
    switch (tool.category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-indigo-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'utility':
        if (tool.slug.includes('compress')) return <Minimize2 className="w-5 h-5 text-purple-500" />;
        return <Layers className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            {getIcon()}
          </div>
          <div className="flex items-center gap-1.5">
            {tool.popular && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Popular
              </span>
            )}
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="uppercase font-mono font-medium">
          {tool.inputFormats[0]} &rarr; {tool.outputFormats[0]}
        </span>
        <span className="capitalize">{tool.category}</span>
      </div>
    </Link>
  );
}
