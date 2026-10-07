'use client';

import React, { useState, useMemo } from 'react';
import { CONVERSION_TOOLS } from '@/lib/format-registry';
import { ToolCard } from '@/components/ToolCard';
import { Search, Layers, FileText, Image as ImageIcon, FileSpreadsheet, Presentation, Minimize2 } from 'lucide-react';
import { FileCategory } from '@/types';

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Tools', icon: <Layers className="w-4 h-4" /> },
    { id: 'pdf', label: 'PDF Tools', icon: <FileText className="w-4 h-4 text-blue-500" /> },
    { id: 'document', label: 'Documents', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { id: 'image', label: 'Images', icon: <ImageIcon className="w-4 h-4 text-purple-500" /> },
    { id: 'spreadsheet', label: 'Spreadsheets', icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> },
    { id: 'presentation', label: 'Presentations', icon: <Presentation className="w-4 h-4 text-amber-500" /> },
    { id: 'utility', label: 'Utilities', icon: <Minimize2 className="w-4 h-4 text-pink-500" /> },
  ];

  const filteredTools = useMemo(() => {
    return CONVERSION_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.inputFormats.some((fmt) => fmt.includes(q)) ||
        tool.outputFormats.some((fmt) => fmt.includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          File Conversion Tools
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-400">
          Over 20+ specialized converters for PDF, Word, Excel, PowerPoint, images, and text.
        </p>

        {/* Search Input */}
        <div className="mt-8 relative max-w-lg mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tools (e.g. Word to PDF, JPG, Compress, CSV)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No tools match &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for common terms like &ldquo;PDF&rdquo;, &ldquo;Word&rdquo;, &ldquo;Image&rdquo;, or &ldquo;Excel&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
