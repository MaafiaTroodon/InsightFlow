import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { uploadDataset } from '../api/datasets.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { DatasetPreviewModal } from '../components/DatasetPreviewModal.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { UploadDropzone } from '../components/UploadDropzone.jsx';
import { formatDateTime } from '../utils/formatters.js';

export function UploadPage() {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileSelection = (file) => {
    setError('');
    setUploadResult(null);
    setSelectedFile(file || null);

    if (file) {
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Choose a CSV, XLSX, or XLS file to continue.');
      toast.error('Only CSV, XLSX, and XLS files are supported');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    const loadingToast = toast.loading('Parsing and cleaning your dataset…');

    try {
      const result = await uploadDataset(selectedFile, setUploadProgress);
      setUploadResult(result);
      toast.dismiss(loadingToast);
      toast.success('Dataset uploaded successfully');
      if (result.warnings?.length) {
        toast('Some values were cleaned or replaced', { icon: '⚠' });
      }
    } catch (uploadError) {
      setError(uploadError.message);
      toast.dismiss(loadingToast);

      if (uploadError.message.toLowerCase().includes('empty')) {
        toast.error('This file appears to be empty');
      } else if (uploadError.message.includes('Unsupported')) {
        toast.error('Only CSV, XLSX, and XLS files are supported');
      } else {
        toast.error('Upload failed. Please check your file.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const pipelineSteps = [
    { label: 'Upload', description: 'Accept CSV, XLSX, and XLS files from local storage.' },
    { label: 'Parse', description: 'Read CSV rows or the first Excel sheet into JSON records.' },
    { label: 'Clean', description: 'Normalize dates, money values, statuses, and duplicate rows.' },
    { label: 'Store', description: 'Save datasets and cleaned rows into Neon PostgreSQL.' },
    { label: 'Analyze', description: 'Generate summary cards, charts, and business insights.' },
  ];

  const uploadTimeline = [
    {
      label: 'File selected',
      complete: Boolean(selectedFile || uploadResult),
      detail: selectedFile?.name || 'Waiting for a file',
    },
    {
      label: 'Parsed',
      complete: Boolean(uploadResult),
      detail: uploadResult ? `${uploadResult.rawRowCount} raw rows parsed` : 'Available after upload',
    },
    {
      label: 'Cleaned',
      complete: Boolean(uploadResult),
      detail: uploadResult ? `${uploadResult.duplicateRowsRemoved} duplicates removed` : 'Normalization and cleanup',
    },
    {
      label: 'Stored',
      complete: Boolean(uploadResult),
      detail: uploadResult ? `${uploadResult.rowCount} rows saved to your account` : 'Stored in Neon PostgreSQL',
    },
    {
      label: 'Ready',
      complete: Boolean(uploadResult),
      detail: uploadResult ? 'Preview modal and dashboard analysis are ready' : 'Ready after processing',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        eyebrow="Upload"
        title="Upload a business dataset"
        description="Upload a CSV or Excel file, review the cleaned data in a modal, then open the dashboard when you are ready."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="min-w-0">
          {isUploading ? (
            <LoadingState
              title="Parsing and cleaning your data"
              description="InsightFlow is validating the file, standardizing records, and storing the cleaned dataset."
            />
          ) : uploadResult ? (
            <Card className="p-6 sm:p-8">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
                Upload complete
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-white">{uploadResult.datasetName}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Your dataset is stored privately and ready for review or dashboard analysis.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">File type</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.fileType}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Raw rows parsed</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.rawRowCount}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cleaned rows saved</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.rowCount}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Duplicates removed</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.duplicateRowsRemoved}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Missing values fixed</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.missingValuesFixed}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Uploaded</p>
                  <p className="mt-2 text-lg font-bold text-white">{formatDateTime(uploadResult.uploadedAt)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setIsPreviewOpen(true)}>
                  View Cleaned Data
                </Button>
                <Button as={Link} to={`/dashboard/${uploadResult.datasetId}`}>
                  Open Dashboard Analysis
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUploadResult(null);
                    setSelectedFile(null);
                    setIsPreviewOpen(false);
                  }}
                >
                  Upload Another File
                </Button>
              </div>
            </Card>
          ) : (
            <UploadDropzone
              inputRef={inputRef}
              isDragging={isDragging}
              selectedFile={selectedFile}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onPick={(file) => handleFileSelection(file)}
              onDropFile={(payload) => {
                if (payload === 'drag') {
                  setIsDragging(true);
                  return;
                }

                if (payload === 'leave') {
                  setIsDragging(false);
                  return;
                }

                setIsDragging(false);
                handleFileSelection(payload);
              }}
              onUpload={handleUpload}
            />
          )}

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <Card className="p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">How it works</p>
          <h2 className="mt-3 text-2xl font-extrabold text-white">Upload → Parse → Clean → Store → Analyze</h2>
          <div className="mt-6 grid gap-4">
            {pipelineSteps.map((step, index) => (
              <article key={step.label} className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                <h3 className="mt-2 text-base font-bold text-white">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Upload status timeline</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {uploadTimeline.map((step) => (
              <article key={step.label} className="rounded-2xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      step.complete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {step.complete ? '✓' : '•'}
                  </div>
                  <p className="font-semibold text-white">{step.label}</p>
                </div>
                <p className="mt-3 text-sm text-slate-400">{step.detail}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <DatasetPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        dataset={
          uploadResult
            ? {
                id: uploadResult.datasetId,
                name: uploadResult.datasetName,
                fileType: uploadResult.fileType,
                rowCount: uploadResult.rowCount,
              }
            : null
        }
        rawRows={uploadResult?.rawPreview || []}
        cleanedRows={uploadResult?.cleanedPreview || []}
        warnings={uploadResult?.warnings || []}
        summary={uploadResult?.summary}
      />
    </div>
  );
}
