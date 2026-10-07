# Convertly — Production Universal File Converter

> **Simple, Fast, and Trustworthy File Conversion Platform.**  
> Built with Next.js 14, React 18, TypeScript, Tailwind CSS, Sharp, pdf-lib, PyMuPDF, and reportlab.

---

## 🚀 Overview

Convertly is an open-source, client-friendly, high-fidelity universal file conversion web platform. Users can effortlessly upload documents, spreadsheets, slides, images, and raw data files to convert between over 20+ formats with zero watermarks, honest real-time progress indicators, and automated 24-hour file purging.

---

## ✨ Features & Supported Conversions

### 📄 Documents & PDF
- **Word → PDF (`.docx`, `.doc` → `.pdf`)**: Exact paragraph structure, headings, tables, and margins.
- **PDF → Word (`.pdf` → `.docx`)**: Paragraph flow reconstruction and editable Word tables.
- **PDF → Text (`.pdf` → `.txt`)**: Fast text extraction with layout and Unicode preservation.
- **PDF → HTML (`.pdf` → `.html`)**: Semantic structured web page output.
- **TXT → PDF (`.txt` → `.pdf`)**: Formatted and paginated PDF documents.
- **HTML → PDF (`.html` → `.pdf`)**: High-fidelity CSS and web layout printing.
- **Markdown → PDF (`.md` → `.pdf`)**: Formatted headings, bullet lists, and publication typography.

### 🖼️ Images & Image Compilation
- **JPG / PNG / WebP / AVIF conversions**: Lossy or lossless compression with customizable quality.
- **JPG → PDF & PNG → PDF**: Page sizing (A4, Letter, Fit to image), margins, and orientation.
- **Images → PDF**: Combine multiple mixed images into a single organized PDF document.
- **PDF → JPG & PDF → PNG**: High-resolution page rendering (150 DPI or 300 DPI) packaged into convenient ZIP archives.

### 📊 Spreadsheets & Presentations
- **CSV → Excel (`.csv` → `.xlsx`)**: Formatted headers, styled fills, and auto-fitted columns.
- **CSV → PDF (`.csv` → `.pdf`)**: Aligned tabular reports with alternating rows.
- **Excel → PDF (`.xlsx` → `.pdf`)**: High-fidelity workbook data conversion.
- **PowerPoint → PDF (`.pptx` → `.pdf`)**: Slides rendered directly to presentation PDF pages.

### 🛠️ PDF Utilities
- **Merge PDF**: Upload multiple PDFs, arrange order, and combine into one document.
- **Split PDF**: Separate pages into individual PDFs with single or ZIP archive download.
- **Compress PDF**: Multi-level stream optimization and deflation with honest before/after reduction metrics.

---

## 🏗️ Architecture

```
convertly/
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── api/                  # REST API routes
│   │   │   ├── convert/          # Multi-part upload and job dispatch
│   │   │   ├── jobs/[id]/        # Real-time job status & polling
│   │   │   ├── jobs/[id]/download# Secure streamed file downloads
│   │   │   ├── tools/            # Catalog endpoints
│   │   │   └── cleanup/          # Automated file expiry cleanup
│   │   ├── tools/                # Searchable directory & dynamic [slug] pages
│   │   ├── pricing/              # Pricing tiers
│   │   ├── security/             # Security architecture & assurances
│   │   ├── status/               # Live operational health dashboard
│   │   ├── about/ & contact/     # Mission & contact forms
│   │   ├── privacy/ & terms/     # Privacy policies and legal terms
│   │   └── blog/                 # Technical guides & articles
│   ├── components/               # UI components
│   │   ├── Navbar.tsx            # Responsive navigation & theme toggle
│   │   ├── Footer.tsx            # Footer navigation & trust standards
│   │   ├── UniversalConverter.tsx# Core drag & drop conversion interface
│   │   ├── ToolCard.tsx          # Interactive tool preview cards
│   │   └── ThemeProvider.tsx     # Light / Dark / System modes
│   ├── config/                   # Central configuration & limits
│   ├── lib/
│   │   ├── format-registry.ts    # Single source of truth for all formats & tools
│   │   ├── storage.ts            # Safe directory isolation & UUID storage
│   │   ├── jobs.ts               # In-memory and persisted job registry
│   │   ├── python-runner.ts      # Sandboxed child process bridge
│   │   └── conversion-engine/    # Multi-adapter conversion orchestrator
│   │       ├── engine.ts         # Dispatcher
│   │       └── adapters/         # Sharp, pdf-lib, ExcelJS, Python adapters
│   ├── types/                    # Shared TypeScript interfaces
│   └── middleware.ts             # API sliding window rate limiting
├── scripts/
│   ├── convert_service.py        # Python PyMuPDF, pdf2docx, reportlab bridge
│   ├── create_test_samples.py    # Test file generator
│   └── test_conversions.ts       # 15-test automated conversion test suite
├── Dockerfile                    # Multi-stage production container
└── docker-compose.yml            # Containerized deployment orchestration
```

---

## ⚙️ Prerequisites & System Dependencies

1. **Node.js**: v18.0.0 or higher (v20+ recommended).
2. **Python**: Python 3.10+ with the following packages:
   ```bash
   pip install pymupdf pdf2docx reportlab python-docx python-pptx openpyxl markdown-it-py pillow
   ```

---

## 📦 Installation & Local Development

1. **Clone the repository and install Node.js dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Run automated test suite (verifies all 15 converters)**:
   ```bash
   npm run test
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

We provide an automated end-to-end integration test suite that generates sample documents across all categories, triggers the actual conversion engine, and verifies byte sizes, output paths, and MIME types:

```bash
# Run 15-conversion automated suite
npm run test
```

All 15 converters are tested:
- `DOCX → PDF`
- `JPG → PDF`
- `PNG → PDF`
- `PDF → JPG (ZIP)`
- `PDF → PNG (ZIP)`
- `XLSX → PDF`
- `PPTX → PDF`
- `TXT → PDF`
- `Multiple Images → PDF`
- `PDF Merge`
- `PDF Split (ZIP)`
- `PDF Compress`
- `PDF → DOCX (Word)`
- `CSV → Excel (XLSX)`
- `Markdown → PDF`

---

## 🔒 Security & Privacy Standard

- **Isolated UUID Storage**: Files are saved with non-guessable random UUIDs. Original filenames are never exposed directly on disk.
- **Header & Magic Byte Sanitization**: Rejects disguised executables, scripts, or corrupt files before conversion.
- **24-Hour Automated Cleanup**: Built-in background daemon purges all temporary files automatically after 24 hours.
- **Immediate User Deletion**: A "Delete file now" button allows instant purging of uploaded and converted files upon completion.
- **Rate Limiting**: Sliding window protection limits requests per minute per IP to prevent service abuse.

---

## 🐳 Docker Deployment

Convertly includes a multi-stage `Dockerfile` with Node.js and Python pre-configured:

```bash
# Build and run with Docker Compose
docker compose up -d --build
```

Access the application at `http://localhost:3000`.

---

## 📄 License

MIT License. Open-source conversion infrastructure.
