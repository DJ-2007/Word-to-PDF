export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-convert-pdf-to-word-without-losing-formatting',
    title: 'How to Convert PDF to Word (DOCX) Without Losing Formatting',
    excerpt: 'Learn how modern OCR and paragraph reconstructors extract tables, columns, and headings from static PDFs into editable Word files.',
    date: 'Oct 14, 2026',
    readTime: '4 min read',
    category: 'Guides',
  },
  {
    slug: 'lossless-vs-lossy-image-compression-jpg-png-webp',
    title: 'JPG vs PNG vs WebP: Which Format Should You Choose?',
    excerpt: 'A comprehensive comparison of raster image formats, transparency trade-offs, compression ratios, and print considerations.',
    date: 'Oct 02, 2026',
    readTime: '6 min read',
    category: 'Optimization',
  },
  {
    slug: 'how-to-merge-multiple-pdfs-securely-online',
    title: 'How to Merge Multiple PDF Documents into One File Safely',
    excerpt: 'Step-by-step instructions on combining PDFs, reordering pages, and ensuring zero metadata leaks.',
    date: 'Sep 25, 2026',
    readTime: '3 min read',
    category: 'Tutorials',
  },
];
