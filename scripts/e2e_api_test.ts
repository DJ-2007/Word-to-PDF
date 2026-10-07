import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('======================================================');
  console.log('      CONVERTLY E2E LIVE HTTP API VERIFICATION       ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Tools catalog
  try {
    process.stdout.write('Test 1: GET /api/tools ... ');
    const res = await fetch(`${BASE_URL}/api/tools`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const tools = json.data?.tools;
    if (!Array.isArray(tools) || tools.length < 15) {
      throw new Error(`Expected at least 15 tools, got ${tools?.length}`);
    }
    console.log(`PASSED (${tools.length} conversion tools active)`);
    passed++;
  } catch (err: any) {
    console.log(`FAILED: ${err.message}`);
    failed++;
  }

  // Helper for file upload and verification
  async function testApiConversion(name: string, toolSlug: string, filePath: string, targetFormat: string, expectedMagic: (buf: Buffer) => boolean) {
    process.stdout.write(`Test: Live API [${name}] ... `);
    try {
      const fileBytes = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      
      const formData = new FormData();
      formData.append('toolSlug', toolSlug);
      formData.append('files', new Blob([fileBytes]), fileName);

      const postRes = await fetch(`${BASE_URL}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!postRes.ok) {
        const text = await postRes.text();
        throw new Error(`POST /api/convert failed HTTP ${postRes.status}: ${text}`);
      }

      const postJson = await postRes.json();
      const jobId = postJson.data?.jobId;
      if (!jobId) throw new Error(`Missing jobId in response: ${JSON.stringify(postJson)}`);

      // Poll job status
      let jobStatus = postJson.data?.status;
      let attempts = 0;
      let finalJob = postJson.data;
      while (['queued', 'uploading', 'processing', 'converting', 'finalizing'].includes(jobStatus) && attempts < 40) {
        await new Promise((r) => setTimeout(r, 600));
        const pollRes = await fetch(`${BASE_URL}/api/jobs/${jobId}`);
        const pollJson = await pollRes.json();
        finalJob = pollJson.data;
        jobStatus = finalJob.status;
        attempts++;
      }

      if (jobStatus !== 'completed') {
        throw new Error(`Job ended with status: ${jobStatus}, error: ${finalJob?.error}`);
      }

      // Download file via named download URL (as used by the frontend Download button)
      const filename = finalJob.outputFile?.filename || 'download';
      const downloadRes = await fetch(`${BASE_URL}/api/jobs/${jobId}/download/${encodeURIComponent(filename)}`);
      if (!downloadRes.ok) throw new Error(`Download failed HTTP ${downloadRes.status}`);

      const disposition = downloadRes.headers.get('content-disposition') || '';
      const arrayBuffer = await downloadRes.arrayBuffer();
      const downloadedBuffer = Buffer.from(arrayBuffer);

      if (downloadedBuffer.length === 0) {
        throw new Error('Downloaded file is empty (0 bytes)');
      }

      if (!expectedMagic(downloadedBuffer)) {
        throw new Error(`Downloaded file failed magic byte verification! Buffer length: ${downloadedBuffer.length}, First 8 hex bytes: ${downloadedBuffer.slice(0, 8).toString('hex')}`);
      }

      console.log(`PASSED (${downloadedBuffer.length} bytes, disposition: "${disposition}")`);
      passed++;
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  // Sample files paths
  const samplesDir = path.join(process.cwd(), 'sample_test_files');
  fs.mkdirSync(samplesDir, { recursive: true });

  // 1. Text to PDF
  const txtPath = path.join(samplesDir, 'test_sample.txt');
  fs.writeFileSync(txtPath, 'Antigravity Convertly E2E Test Document\nLine 2 of sample text file.');
  await testApiConversion('TXT -> PDF', 'txt-to-pdf', txtPath, 'pdf', (buf) => buf.toString('utf8', 0, 5).startsWith('%PDF'));

  // 2. CSV to XLSX
  const csvPath = path.join(samplesDir, 'test_sample.csv');
  fs.writeFileSync(csvPath, 'Product,Price,Quantity\nWidget A,19.99,100\nWidget B,29.99,50\nTotal,3499.00,150');
  await testApiConversion('CSV -> XLSX', 'csv-to-excel', csvPath, 'xlsx', (buf) => buf.slice(0, 2).toString() === 'PK');

  // 3. Word to PDF
  const docxPath = path.join(process.cwd(), 'sample_docs', 'API.NET.docx');
  if (fs.existsSync(docxPath)) {
    await testApiConversion('DOCX -> PDF', 'word-to-pdf', docxPath, 'pdf', (buf) => buf.toString('utf8', 0, 5).startsWith('%PDF'));
  }

  // 4. PDF to Word (DOCX)
  const pdfSamplePath = path.join(samplesDir, 'test_sample.pdf');
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('Convertly PDF to Word E2E Verification', { x: 50, y: 350, size: 20, font });
  page.drawText('This document converts accurately into a Microsoft Word (.docx) file.', { x: 50, y: 310, size: 14 });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfSamplePath, Buffer.from(pdfBytes));

  await testApiConversion('PDF -> DOCX (Word)', 'pdf-to-word', pdfSamplePath, 'docx', (buf) => buf.slice(0, 2).toString() === 'PK');

  // 5. PDF Split
  await testApiConversion('PDF Split', 'split-pdf', pdfSamplePath, 'pdf', (buf) => buf.toString('utf8', 0, 5).startsWith('%PDF') || buf.slice(0, 2).toString() === 'PK');

  // 6. PDF Compress
  await testApiConversion('PDF Compress', 'compress-pdf', pdfSamplePath, 'pdf', (buf) => buf.toString('utf8', 0, 5).startsWith('%PDF'));

  // 7. JPG -> PNG
  const sharp = (await import('sharp')).default;
  const jpgPath = path.join(samplesDir, 'test_sample.jpg');
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 59, g: 130, b: 246 } }
  }).jpeg().toFile(jpgPath);

  await testApiConversion('JPG -> PNG', 'jpg-to-png', jpgPath, 'png', (buf) => buf.slice(0, 4).toString('hex') === '89504e47');

  console.log('\n======================================================');
  console.log(`E2E API SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
