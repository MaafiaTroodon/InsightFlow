import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDataset } from '../api/datasets.js';
import { PreviewTable } from '../components/PreviewTable.jsx';
import { SectionHeader } from '../components/SectionHeader.jsx';

const acceptedExtensions = '.csv,.xlsx,.xls';

export function UploadPage() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const fileTypeLabel = useMemo(() => {
    if (!selectedFile) {
      return '';
    }

    const extension = selectedFile.name.split('.').pop()?.toUpperCase();
    return extension ? `${extension} file selected` : 'File selected';
  }, [selectedFile]);

  const handleFileSelection = (file) => {
    setError('');
    setUploadResult(null);
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Choose a CSV, XLSX, or XLS file to continue.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const result = await uploadDataset(selectedFile, setUploadProgress);
      setUploadResult(result);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeader
        eyebrow="Upload"
        title="Upload a business dataset"
        description="Drag in a CSV or Excel file, parse the first sheet, preview the raw rows, then inspect the cleaned output before opening the dashboard."
      />

      <section className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
          <div
            role="button"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFileSelection(event.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                inputRef.current?.click();
              }
            }}
            className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed p-8 text-center transition ${
              isDragging ? 'border-teal-300 bg-teal-500/10' : 'border-white/15 bg-white/5 hover:bg-white/[0.07]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={acceptedExtensions}
              className="hidden"
              onChange={(event) => handleFileSelection(event.target.files?.[0])}
            />
            <div className="h-16 w-16 rounded-3xl bg-teal-500/15" />
            <h2 className="mt-6 text-2xl font-extrabold text-white">Drop CSV or Excel here</h2>
            <p className="mt-3 max-w-md text-slate-300">
              Accepts `.csv`, `.xlsx`, and `.xls`. InsightFlow parses the file, applies cleaning rules, saves it to Neon PostgreSQL, and generates a dashboard.
            </p>
            <div className="mt-6 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
              {fileTypeLabel || 'No file selected'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isUploading ? 'Processing dataset...' : 'Start Analysis'}
          </button>

          {isUploading ? (
            <div className="mt-5">
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-400">Upload progress: {uploadProgress}%</p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {uploadResult ? (
            <div className="mt-6 rounded-[1.5rem] border border-teal-400/20 bg-teal-500/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Upload complete</p>
              <h3 className="mt-2 text-xl font-bold text-white">{uploadResult.datasetName}</h3>
              <p className="mt-2 text-sm text-slate-200">
                Parsed as {uploadResult.fileType}. Dataset saved successfully with {uploadResult.summary.projectCount} cleaned rows.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/${uploadResult.datasetId}`)}
                className="mt-4 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                Open Dashboard
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6">
          <PreviewTable title="Raw Data" rows={uploadResult?.rawPreview || []} kind="raw" />
          <PreviewTable title="Cleaned Data" rows={uploadResult?.cleanedPreview || []} kind="cleaned" />
          {uploadResult?.warnings?.length ? (
            <section className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6">
              <h2 className="text-lg font-bold text-amber-100">Cleaning Warnings</h2>
              <div className="mt-4 grid gap-2 text-sm text-amber-50">
                {uploadResult.warnings.map((warning, index) => (
                  <p key={`${warning}-${index}`}>{warning}</p>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
