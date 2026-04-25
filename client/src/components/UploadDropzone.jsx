import { Button } from './Button.jsx';
import { Card } from './Card.jsx';

export function UploadDropzone({
  inputRef,
  isDragging,
  selectedFile,
  isUploading,
  uploadProgress,
  onPick,
  onDropFile,
  onUpload,
}) {
  const formats = ['CSV', 'XLSX', 'XLS'];

  return (
    <Card className="p-6 sm:p-8">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => {
          event.preventDefault();
          onDropFile('drag');
        }}
        onDragLeave={() => onDropFile('leave')}
        onDrop={(event) => {
          event.preventDefault();
          onDropFile(event.dataTransfer.files?.[0] || null);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            inputRef.current?.click();
          }
        }}
        className={`flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
          isDragging ? 'border-teal-300 bg-teal-500/10' : 'border-white/15 bg-white/5 hover:bg-white/[0.07]'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => onPick(event.target.files?.[0])} />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15 text-2xl text-teal-300">↑</div>
        <h2 className="mt-6 text-2xl font-extrabold text-white">Drop your dataset here</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
          Upload CSV or Excel business data and InsightFlow will parse, clean, store, and analyze it automatically.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {formats.map((format) => (
            <span key={format} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
              {format}
            </span>
          ))}
        </div>
        <div className="mt-6 max-w-full rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">
          <span className="block max-w-[22rem] truncate">{selectedFile ? selectedFile.name : 'No file selected'}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Button className="w-full" onClick={onUpload} disabled={isUploading}>
          {isUploading ? 'Parsing and cleaning your data…' : 'Start Analysis'}
        </Button>
        {isUploading ? (
          <div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Upload progress: {uploadProgress}%</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
