import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, CheckCircle2, AlertTriangle, Info, X, Zap,
  Building2, DollarSign, Calendar, Hash, User, Loader2, Eye,
  ChevronDown, ChevronUp, Download,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard';

const CONFIDENCE_COLOR = (score) => {
  if (score >= 0.8) return 'text-emerald-400';
  if (score >= 0.5) return 'text-amber-400';
  return 'text-red-400';
};

const CONFIDENCE_BG = (score) => {
  if (score >= 0.8) return 'bg-emerald-500/10 border-emerald-500/30';
  if (score >= 0.5) return 'bg-amber-500/10 border-amber-500/30';
  return 'bg-red-500/10 border-red-500/30';
};

function ConfidenceBadge({ score }) {
  const pct = Math.round(score * 100);
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border ${CONFIDENCE_BG(score)} ${CONFIDENCE_COLOR(score)} font-mono`}>
      {pct}%
    </span>
  );
}

function FieldRow({ icon: Icon, label, value, confidence }) {
  if (!value && confidence < 0.4) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-rim/30 last:border-0">
      <Icon className="w-4 h-4 text-ink-muted mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-muted">{label}</div>
        <div className={`text-sm mt-0.5 ${value ? 'text-white font-medium' : 'text-ink-muted italic'}`}>
          {value || 'Not detected'}
        </div>
      </div>
      {confidence !== undefined && <ConfidenceBadge score={confidence} />}
    </div>
  );
}

function ResultCard({ result, onClose }) {
  const [showRaw, setShowRaw] = useState(false);
  const f = result.fields || {};
  const scores = result.confidenceScores || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header strip */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${
        result.overallConfidence >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' :
        result.overallConfidence >= 40 ? 'bg-amber-500/10 border-amber-500/30' :
        'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${
            result.overallConfidence >= 70 ? 'text-emerald-400' :
            result.overallConfidence >= 40 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {result.overallConfidence}%
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{result.docType} — {result.fileName}</div>
            <div className="text-xs text-ink-muted mt-0.5">
              {(result.fileSize / 1024).toFixed(1)} KB · {result.rawTextLength.toLocaleString()} chars extracted
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* AI Summary */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wide mb-2">
          <Zap className="w-3.5 h-3.5" /> AI Summary
        </div>
        <p className="text-sm text-white/90 leading-relaxed">{result.summary}</p>
      </GlassCard>

      {/* Flags */}
      {result.flags?.length > 0 && (
        <div className="space-y-2">
          {result.flags.map((flag, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm border ${
              flag.type === 'danger'  ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              flag.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-sky-500/10 border-sky-500/20 text-sky-400'
            }`}>
              {flag.type === 'danger' ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <Info className="w-4 h-4 shrink-0 mt-0.5" />}
              {flag.message}
            </div>
          ))}
        </div>
      )}

      {/* Extracted Fields */}
      <GlassCard>
        <CardHeader icon={FileText} title="Extracted Fields" accent="brand" />
        <CardBody>
          <div>
            <FieldRow icon={Hash}      label="Invoice Number" value={f.invoiceNumber} confidence={scores.invoiceNumber} />
            <FieldRow icon={Building2} label="Vendor / From"  value={f.vendorName}    confidence={scores.vendorName} />
            <FieldRow icon={User}      label="Client / To"    value={f.clientName}    confidence={scores.clientName} />
            <FieldRow icon={FileText}  label="Project / Job"  value={f.projectName}   confidence={scores.projectName} />
            <FieldRow icon={Calendar}  label="Invoice Date"   value={f.invoiceDate}   confidence={scores.invoiceDate} />
            <FieldRow icon={Calendar}  label="Due Date"       value={f.dueDate}        />
            <FieldRow icon={DollarSign}label="Total Amount"   value={f.totalAmount != null ? `$${Number(f.totalAmount).toLocaleString()}` : null} confidence={scores.totalAmount} />
            {f.subtotal != null && (
              <FieldRow icon={DollarSign} label="Subtotal" value={`$${Number(f.subtotal).toLocaleString()}`} />
            )}
            {f.taxAmount != null && (
              <FieldRow icon={DollarSign} label="Tax (GST/VAT)" value={`$${Number(f.taxAmount).toLocaleString()}`} />
            )}
            {f.poNumber && <FieldRow icon={Hash} label="PO Number" value={f.poNumber} />}
            {f.abn && <FieldRow icon={Hash} label="ABN" value={f.abn} />}
          </div>
        </CardBody>
      </GlassCard>

      {/* Line Items */}
      {result.lineItems?.length > 0 && (
        <GlassCard>
          <CardHeader icon={DollarSign} title={`Line Items (${result.lineItems.length})`} accent="gold" />
          <CardBody>
            <div className="space-y-1">
              {result.lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-rim/30 last:border-0">
                  <span className="text-ink-muted truncate flex-1 mr-4">{item.description}</span>
                  <span className="text-white font-mono">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </GlassCard>
      )}

      {/* Raw Text Preview */}
      <GlassCard>
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setShowRaw(v => !v)}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-ink-muted">
            <Eye className="w-4 h-4" />
            Raw Text Preview
          </div>
          {showRaw ? <ChevronUp className="w-4 h-4 text-ink-muted" /> : <ChevronDown className="w-4 h-4 text-ink-muted" />}
        </div>
        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-rim"
            >
              <pre className="px-4 py-3 text-xs text-ink-muted font-mono whitespace-pre-wrap leading-relaxed">
                {result.rawTextPreview}…
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

export default function PdfExtractPage() {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/pdf/extract', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Extraction failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-400" />
          </div>
          PDF Intelligence
        </h1>
        <p className="text-ink-muted text-sm mt-1">
          Upload real invoices, progress claims, or site reports — AI extracts key fields automatically.
        </p>
      </div>

      {/* Drop Zone */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer py-16 text-center ${
            dragging
              ? 'border-brand-400 bg-brand-500/10'
              : 'border-rim hover:border-brand-500/50 hover:bg-surface'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => processFile(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
              <div className="text-white font-medium">Extracting data from PDF…</div>
              <div className="text-ink-muted text-sm">Parsing text and detecting fields</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-rim flex items-center justify-center">
                <Upload className="w-7 h-7 text-ink-muted" />
              </div>
              <div>
                <div className="text-white font-semibold">Drop your PDF here</div>
                <div className="text-ink-muted text-sm mt-1">or click to browse — invoices, claims, reports</div>
              </div>
              <div className="flex gap-2 text-xs text-ink-muted">
                <span className="bg-surface border border-rim px-2 py-1 rounded">Tax Invoices</span>
                <span className="bg-surface border border-rim px-2 py-1 rounded">Progress Claims</span>
                <span className="bg-surface border border-rim px-2 py-1 rounded">Purchase Orders</span>
                <span className="bg-surface border border-rim px-2 py-1 rounded">Site Reports</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <ResultCard
          result={result}
          onClose={() => { setResult(null); setError(null); }}
        />
      )}

      {result && (
        <button
          onClick={() => { setResult(null); setError(null); }}
          className="w-full py-3 rounded-xl border border-rim text-ink-muted text-sm hover:text-white hover:border-brand-500/40 transition-colors"
        >
          Extract Another PDF
        </button>
      )}
    </div>
  );
}
