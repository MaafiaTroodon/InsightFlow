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
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-5 sm:p-8">
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
        className={`flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center transition sm:min-h-[340px] sm:px-6 sm:py-10 ${
          isDragging ? 'border-teal-300 bg-teal-500/10' : 'border-white/15 bg-white/5 hover:bg-white/[0.07]'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(event) => onPick(event.target.files?.[0])} />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/15 text-2xl text-teal-300">↑</div>
        <h2 className="mt-6 text-xl font-extrabold text-white sm:text-2xl">Drop your dataset here</h2>
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
        </div>

        <div className="border-t border-white/10 bg-gradient-to-br from-teal-400/10 via-transparent to-sky-400/10 p-5 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">Preview Flow</p>
          <h3 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">Upload once, review clean outputs, then open analysis.</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            InsightFlow is built for operational spreadsheets. Parse the file, fix messy values, preview the repaired rows, move into charts and automated business insights, then export a polished PDF report.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Raw to clean</p>
                <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-200">Automatic</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="h-2 w-16 rounded-full bg-white/10" />
                  <div className="mt-3 h-7 rounded-lg bg-amber-400/15" />
                  <div className="mt-2 h-7 rounded-lg bg-rose-400/15" />
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="h-2 w-16 rounded-full bg-white/10" />
                  <div className="mt-3 h-7 rounded-lg bg-emerald-400/20" />
                  <div className="mt-2 h-7 rounded-lg bg-sky-400/20" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Analysis preview</p>
              <div className="mt-4 flex h-28 items-end gap-2 rounded-xl bg-white/[0.04] p-3">
                <div className="h-10 flex-1 rounded-t-lg bg-slate-600" />
                <div className="h-14 flex-1 rounded-t-lg bg-cyan-500/70" />
                <div className="h-8 flex-1 rounded-t-lg bg-sky-500/70" />
                <div className="h-20 flex-1 rounded-t-lg bg-amber-400/70" />
                <div className="h-16 flex-1 rounded-t-lg bg-emerald-400/70" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">PDF report</p>
                <span className="rounded-full bg-teal-500/15 px-3 py-1 text-[10px] font-semibold text-teal-200">Preview + Download</span>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-slate-900">
                <div className="h-2 w-24 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-3/4 rounded-full bg-slate-200" />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="h-7 rounded-lg bg-slate-100" />
                  <div className="h-7 rounded-lg bg-slate-100" />
                  <div className="h-7 rounded-lg bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
