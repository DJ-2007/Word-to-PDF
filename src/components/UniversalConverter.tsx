'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ConversionToolDefinition, JobStatus } from '@/types';
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Trash2,
  ArrowRight,
  Loader2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  Settings2,
} from 'lucide-react';

interface UniversalConverterProps {
  tool: ConversionToolDefinition;
}

interface UploadedFileItem {
  file: File;
  id: string;
  previewUrl?: string;
}

export function UniversalConverter({ tool }: UniversalConverterProps) {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [options, setOptions] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    tool.options?.forEach((opt) => {
      initial[opt.id] = opt.defaultValue;
    });
    return initial;
  });

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [outputFile, setOutputFile] = useState<{
    filename: string;
    size: number;
    mimeType: string;
    isZip?: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: UploadedFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!tool.inputFormats.includes(ext)) {
        setErrorMessage(
          `File '${file.name}' is not supported. Supported formats: .${tool.inputFormats.join(', .')}`
        );
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage(`File '${file.name}' exceeds the 50 MB free limit.`);
        return;
      }

      let previewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      validFiles.push({
        file,
        id: `${file.name}_${Date.now()}_${i}`,
        previewUrl,
      });
    }

    if (!tool.allowMultiple) {
      setFiles([validFiles[0]]);
    } else {
      setFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return tool.maxFiles ? combined.slice(0, tool.maxFiles) : combined;
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setErrorMessage(null);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleStartConversion = async () => {
    if (files.length === 0) return;

    setErrorMessage(null);
    setJobStatus('uploading');
    setProgress(15);
    setStatusMessage('Uploading file(s) to secure conversion pipeline...');

    try {
      const formData = new FormData();
      formData.append('toolSlug', tool.slug);
      formData.append('options', JSON.stringify(options));

      files.forEach((f) => {
        formData.append('files', f.file);
      });

      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error?.message || 'Conversion request failed');
      }

      setJobId(json.data.jobId);
      setJobStatus('processing');
      setProgress(30);
      setStatusMessage('Files queued for processing...');
    } catch (err: any) {
      setJobStatus('failed');
      setErrorMessage(err.message || 'Failed to submit files for conversion.');
    }
  };

  // Poll for job status
  useEffect(() => {
    if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const json = await res.json();

        if (json.success && json.data) {
          const data = json.data;
          setJobStatus(data.status);
          setProgress(data.progress || 50);
          setStatusMessage(data.statusMessage || 'Processing...');

          if (data.status === 'completed') {
            setOutputFile(data.outputFile);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setErrorMessage(data.errorMessage || 'Conversion failed. Please try again.');
            clearInterval(interval);
          }
        }
      } catch (err) {
        // Retry silently on transient poll errors
      }
    }, 800);

    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const handleReset = () => {
    setFiles([]);
    setJobId(null);
    setJobStatus(null);
    setProgress(0);
    setStatusMessage('');
    setErrorMessage(null);
    setOutputFile(null);
  };

  const handleDeleteFileNow = async () => {
    if (!jobId) return;
    try {
      await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      handleReset();
    } catch (err) {
      handleReset();
    }
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!jobId || !outputFile) return;

    try {
      e.preventDefault();
      const downloadUrl = `/api/jobs/${jobId}/download/${encodeURIComponent(outputFile.filename)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        window.location.href = downloadUrl;
        return;
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = outputFile.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      window.location.href = `/api/jobs/${jobId}/download/${encodeURIComponent(outputFile.filename)}`;
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    }
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Top Banner info */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {tool.name} Engine
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Supported:</span>
          <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200 uppercase">
            {tool.inputFormats.join(', ')}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-700 dark:text-red-300 animate-fadeIn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm flex-1">
              <p className="font-semibold">Unable to process file</p>
              <p className="text-red-600 dark:text-red-400 mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State 1: Ready to Upload / Dropped files */}
        {!jobStatus && (
          <div className="space-y-6">
            {files.length === 0 ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={tool.allowMultiple}
                  accept={tool.inputFormats.map((f) => `.${f}`).join(',')}
                  onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Upload your {tool.inputFormats.map((f) => f.toUpperCase()).join(' or ')} file
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
                  Drag and drop your file here, or click to browse from your device
                </p>

                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all">
                  Choose {tool.allowMultiple ? 'Files' : 'File'}
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span>Up to 50 MB</span>
                  <span>•</span>
                  <span>End-to-End Privacy</span>
                  <span>•</span>
                  <span>Auto-deleted in 24h</span>
                </div>
              </div>
            ) : (
              /* Selected Files List */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Selected File{files.length > 1 ? `s (${files.length})` : ''}
                  </h4>
                  {tool.allowMultiple && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      + Add more files
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={tool.allowMultiple}
                    accept={tool.inputFormats.map((f) => `.${f}`).join(',')}
                    onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
                  {files.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.previewUrl ? (
                          <img
                            src={item.previewUrl}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            {getFileIcon(item.file.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-slate-400">{formatFileSize(item.file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {tool.allowMultiple && files.length > 1 && (
                          <div className="flex flex-col mr-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => moveFile(idx, 'up')}
                              className="text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-20 px-1"
                              title="Move up"
                            >
                              ▲
                            </button>
                            <button
                              disabled={idx === files.length - 1}
                              onClick={() => moveFile(idx, 'down')}
                              className="text-[10px] text-slate-400 hover:text-slate-600 disabled:opacity-20 px-1"
                              title="Move down"
                            >
                              ▼
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conversion Options (if configured for this tool) */}
                {tool.options && tool.options.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      <Settings2 className="w-4 h-4 text-indigo-500" />
                      <span>Conversion Settings</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tool.options.map((opt) => (
                        <div key={opt.id} className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {opt.label}
                          </label>

                          {opt.type === 'select' && (
                            <select
                              value={options[opt.id]}
                              onChange={(e) =>
                                setOptions({ ...options, [opt.id]: e.target.value })
                              }
                              className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {opt.options?.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {opt.type === 'range' && (
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={opt.min || 1}
                                max={opt.max || 100}
                                step={opt.step || 1}
                                value={options[opt.id]}
                                onChange={(e) =>
                                  setOptions({ ...options, [opt.id]: parseInt(e.target.value, 10) })
                                }
                                className="flex-1 accent-indigo-600 cursor-pointer"
                              />
                              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                                {options[opt.id]}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Convert Trigger Button */}
                <div className="pt-2">
                  <button
                    onClick={handleStartConversion}
                    className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.005]"
                  >
                    <span>Start Conversion</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State 2: Conversion in progress */}
        {jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed' && (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {statusMessage || 'Processing your files...'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Please wait while our engine renders and formats your document.
              </p>
            </div>

            {/* Honest Progress Bar */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(progress, 15)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span className="capitalize">{jobStatus}</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Completed Successfully */}
        {jobStatus === 'completed' && outputFile && (
          <div className="py-8 px-4 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Your file is ready!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Conversion completed successfully and file is verified.
              </p>
            </div>

            {/* Output file badge */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {outputFile.filename}
                  </p>
                  <p className="text-xs text-slate-400">{formatFileSize(outputFile.size)}</p>
                </div>
              </div>
              {outputFile.isZip && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  ZIP Package
                </span>
              )}
            </div>

            {/* Download and Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`/api/jobs/${jobId}/download/${encodeURIComponent(outputFile.filename)}`}
                download={outputFile.filename}
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Download Converted File</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another File</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-400">
              <button
                onClick={handleDeleteFileNow}
                className="hover:text-red-500 inline-flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete file now from server</span>
              </button>
              <span>•</span>
              <span>Automatic deletion in 24 hours</span>
            </div>
          </div>
        )}

        {/* State 4: Conversion Failed */}
        {jobStatus === 'failed' && (
          <div className="py-8 px-4 text-center space-y-6">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
