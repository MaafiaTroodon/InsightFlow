import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadDataset } from '../api/datasets.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { PreviewTabs } from '../components/PreviewTabs.jsx';
import { UploadDropzone } from '../components/UploadDropzone.jsx';

export function UploadPage() {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);

  useEffect(() => {
    if (!uploadResult?.datasetId) {
      return undefined;
    }

    setShowRedirectNotice(true);
    const timeout = window.setTimeout(() => {
      navigate(`/dashboard/${uploadResult.datasetId}`);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [navigate, uploadResult]);

  const handleFileSelection = (file) => {
    setError('');
    setUploadResult(null);
    setShowRedirectNotice(false);
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

  const pipelineSteps = [
    { label: 'Upload', description: 'Accept CSV, XLSX, and XLS files from local storage.' },
    { label: 'Parse', description: 'Read CSV rows or the first Excel sheet into JSON records.' },
    { label: 'Clean', description: 'Normalize dates, money values, statuses, and duplicate rows.' },
    { label: 'Store', description: 'Save datasets and cleaned rows into Neon PostgreSQL.' },
    { label: 'Analyze', description: 'Generate summary cards, charts, and business insights.' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        eyebrow="Upload"
        title="Upload a business dataset"
        description="Drop in a business file, preview the parsed rows, and move directly into a polished analysis dashboard."
      />

      {showRedirectNotice ? (
        <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-500/10 px-4 py-3 text-sm text-teal-50">
          Dataset uploaded. Opening dashboard…
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="min-w-0">
          {isUploading ? (
            <LoadingState title="Parsing and cleaning your data" description="InsightFlow is validating the file, standardizing records, and storing the cleaned dataset." />
          ) : uploadResult ? (
            <Card className="p-6 sm:p-8">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100">
                Upload complete
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-white">{uploadResult.datasetName}</h2>
              <p className="mt-2 text-sm text-slate-300">Your dataset is stored and ready for analysis.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">File type</p>
                  <p className="mt-2 text-lg font-bold text-white">{uploadResult.fileType}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rows processed</p>
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
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} to={`/dashboard/${uploadResult.datasetId}`}>View Dashboard</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUploadResult(null);
                    setSelectedFile(null);
                    setShowRedirectNotice(false);
                  }}
                >
                  Upload another file
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
        <PreviewTabs
          rawRows={uploadResult?.rawPreview || []}
          cleanedRows={uploadResult?.cleanedPreview || []}
          warnings={uploadResult?.warnings || []}
        />
      </section>
    </div>
  );
}
