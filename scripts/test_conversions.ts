import fs from 'fs';
import path from 'path';
import { conversionEngine } from '../src/lib/conversion-engine/engine';
import { saveUploadedFile, initStorage } from '../src/lib/storage';
import { createJob } from '../src/lib/jobs';

const SAMPLES_DIR = path.join(process.cwd(), '.temp_storage', 'samples');

interface TestSpec {
  name: string;
  slug: string;
  files: string[];
  options?: Record<string, any>;
  expectedExt: string;
  isZip?: boolean;
}

const TESTS: TestSpec[] = [
  {
    name: '1. DOCX -> PDF',
    slug: 'word-to-pdf',
    files: ['sample.docx'],
    expectedExt: 'pdf',
  },
  {
    name: '2. JPG -> PDF',
    slug: 'jpg-to-pdf',
    files: ['sample1.jpg'],
    options: { pageSize: 'a4', orientation: 'portrait' },
    expectedExt: 'pdf',
  },
  {
    name: '3. PNG -> PDF',
    slug: 'png-to-pdf',
    files: ['sample1.png'],
    expectedExt: 'pdf',
  },
  {
    name: '4. PDF -> JPG',
    slug: 'pdf-to-jpg',
    files: ['sample.pdf'],
    options: { dpi: '150' },
    expectedExt: 'zip', // Multi-page PDF yields zip package
    isZip: true,
  },
  {
    name: '5. PDF -> PNG',
    slug: 'pdf-to-png',
    files: ['sample.pdf'],
    options: { dpi: '150' },
    expectedExt: 'zip',
    isZip: true,
  },
  {
    name: '6. XLSX -> PDF',
    slug: 'excel-to-pdf',
    files: ['sample.xlsx'],
    expectedExt: 'pdf',
  },
  {
    name: '7. PPTX -> PDF',
    slug: 'powerpoint-to-pdf',
    files: ['sample.pptx'],
    expectedExt: 'pdf',
  },
  {
    name: '8. TXT -> PDF',
    slug: 'txt-to-pdf',
    files: ['sample.txt'],
    expectedExt: 'pdf',
  },
  {
    name: '9. Multiple Images -> PDF',
    slug: 'images-to-pdf',
    files: ['sample1.jpg', 'sample2.jpg', 'sample1.png'],
    options: { pageSize: 'a4', margin: 'small' },
    expectedExt: 'pdf',
  },
  {
    name: '10. PDF Merge',
    slug: 'merge-pdf',
    files: ['sample.pdf', 'sample2.pdf'],
    expectedExt: 'pdf',
  },
  {
    name: '11. PDF Split',
    slug: 'split-pdf',
    files: ['sample.pdf'],
    expectedExt: 'zip',
    isZip: true,
  },
  {
    name: '12. PDF Compress',
    slug: 'compress-pdf',
    files: ['sample.pdf'],
    options: { level: 'medium' },
    expectedExt: 'pdf',
  },
  {
    name: '13. PDF -> DOCX (Word)',
    slug: 'pdf-to-word',
    files: ['sample.pdf'],
    expectedExt: 'docx',
  },
  {
    name: '14. CSV -> Excel',
    slug: 'csv-to-excel',
    files: ['sample.csv'],
    expectedExt: 'xlsx',
  },
  {
    name: '15. Markdown -> PDF',
    slug: 'markdown-to-pdf',
    files: ['sample.md'],
    expectedExt: 'pdf',
  },
];

async function runTests() {
  console.log('\n======================================================');
  console.log('   CONVERTLY PRODUCTION TEST SUITE (15 CONVERTERS)    ');
  console.log('======================================================\n');

  initStorage();

  let passed = 0;
  let failed = 0;

  for (const t of TESTS) {
    console.log(`Testing [${t.name}] ...`);
    const start = Date.now();

    try {
      // 1. Prepare files
      const savedInputFiles = [];
      for (const fileName of t.files) {
        const fullSamplePath = path.join(SAMPLES_DIR, fileName);
        if (!fs.existsSync(fullSamplePath)) {
          throw new Error(`Sample file does not exist: ${fullSamplePath}`);
        }
        const buffer = await fs.promises.readFile(fullSamplePath);
        const saved = await saveUploadedFile(buffer, fileName);
        savedInputFiles.push({
          id: saved.id,
          originalName: saved.originalName,
          size: saved.size,
          mimeType: 'application/octet-stream',
          storedPath: saved.storedPath,
        });
      }

      // 2. Create job
      const job = createJob(t.slug, savedInputFiles, t.options || {});

      // 3. Process job
      const result = await conversionEngine.processJob(job);

      // 4. Verify output
      if (!fs.existsSync(result.path)) {
        throw new Error(`Output file not created on disk: ${result.path}`);
      }

      const stats = await fs.promises.stat(result.path);
      if (stats.size === 0) {
        throw new Error(`Output file is empty (0 bytes): ${result.path}`);
      }

      const outExt = path.extname(result.filename).replace('.', '').toLowerCase();
      if (outExt !== t.expectedExt) {
        throw new Error(`Expected extension .${t.expectedExt} but got .${outExt}`);
      }

      const duration = Date.now() - start;
      console.log(`PASSED (${duration}ms, size: ${(stats.size / 1024).toFixed(1)} KB)`);
      passed++;
    } catch (err: any) {
      console.log(`FAILED!`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${TESTS.length})`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
