import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { ConversionAdapter, ConvertedOutput } from '../types';
import { ConversionJob } from '@/types';
import { getOutputPath } from '@/lib/storage';

export class SpreadsheetAdapter implements ConversionAdapter {
  name = 'ExcelJsSpreadsheetAdapter';

  canHandle(slug: string, inputExts: string[], outputExt: string): boolean {
    const isCsvToExcel = slug === 'csv-to-excel' || (inputExts.includes('csv') && outputExt.toLowerCase() === 'xlsx');
    return isCsvToExcel;
  }

  async convert(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { inputFiles } = job;
    const input = inputFiles[0];

    onProgress?.(30, 'Reading CSV data...');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    const csvContent = await fs.promises.readFile(input.storedPath, 'utf-8');
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    onProgress?.(50, 'Formatting cells and columns...');

    for (let r = 0; r < lines.length; r++) {
      // Handle simple CSV / comma split with quoted field awareness
      const line = lines[r];
      const cells: string[] = [];
      let inQuotes = false;
      let currentCell = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());

      const row = worksheet.addRow(cells);

      // Style header row
      if (r === 0) {
        row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' },
        };
        row.height = 24;
      }
    }

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLen = cell.value ? cell.value.toString().length : 0;
        if (cellLen > maxLen) maxLen = Math.min(cellLen + 2, 40);
      });
      column.width = maxLen;
    });

    onProgress?.(80, 'Generating XLSX workbook...');

    const baseName = path.parse(input.originalName).name;
    const targetFilename = `${baseName}.xlsx`;
    const { fullPath } = getOutputPath(targetFilename);

    await workbook.xlsx.writeFile(fullPath);
    const stats = await fs.promises.stat(fullPath);

    onProgress?.(100, 'Spreadsheet ready.');
    return {
      filename: targetFilename,
      path: fullPath,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: stats.size,
      isZip: false,
    };
  }
}
