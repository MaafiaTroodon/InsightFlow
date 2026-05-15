import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Plus, Search, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, ChevronDown, ChevronUp, X, Send, Loader2,
  MapPin, Calendar, User, Cloud, FileText, Zap, Image as ImageIcon,
  Paperclip, ChevronLeft, ChevronRight, ZoomIn, Download,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard';

// ── Colours ────────────────────────────────────────────────────────────────────
const RISK = {
  high:   { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     dot: 'bg-red-400' },
  medium: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  low:    { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

// ── Lightbox ───────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const img = images[idx];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/60 bg-black/40 px-3 py-1 rounded-full">
        {idx + 1} / {images.length}
      </div>

      {/* Prev */}
      {idx > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setIdx(i => i - 1); }}
          className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <motion.img
        key={idx}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        src={img.url}
        alt={img.name}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Next */}
      {idx < images.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setIdx(i => i + 1); }}
          className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Caption */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-sm text-white/80">{img.name}</div>
        <div className="text-xs text-white/40 mt-0.5">{img.size ? `${(img.size / (1024 * 1024)).toFixed(2)} MiB` : ''}</div>
      </div>
    </div>
  );
}

// ── Photo Grid ─────────────────────────────────────────────────────────────────
function PhotoGrid({ attachments, onOpen }) {
  if (!Array.isArray(attachments) || attachments.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Paperclip className="w-3 h-3" /> Attachments ({attachments.length})
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {attachments.map((att, i) => (
          <button
            key={i}
            onClick={() => onOpen(i)}
            className="relative group aspect-square rounded-lg overflow-hidden border border-rim hover:border-brand-500/50 transition-colors"
          >
            <img
              src={att.url}
              alt={att.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-full bg-surface items-center justify-center">
              <ImageIcon className="w-5 h-5 text-ink-muted" />
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-[9px] text-white/80 truncate">{att.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Log Card ──────────────────────────────────────────────────────────────────
function LogCard({ log, onExpand, expanded }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const risk        = RISK[log.riskLevel] || RISK.low;
  const delays      = Array.isArray(log.delays)      ? log.delays      : [];
  const risks       = Array.isArray(log.risks)       ? log.risks       : [];
  const actions     = Array.isArray(log.actionItems) ? log.actionItems : [];
  const contractors = Array.isArray(log.contractors) ? log.contractors : [];
  const attachments = Array.isArray(log.attachments) ? log.attachments : [];

  return (
    <>
      <motion.div layout className={`rounded-xl border ${risk.bg} ${risk.border} overflow-hidden`}>
        {/* Header row */}
        <div className="p-4 cursor-pointer select-none" onClick={() => onExpand(log.id)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white text-sm">{log.projectName}</span>
                <span className={`inline-block w-2 h-2 rounded-full ${risk.dot}`} />
                <span className={`text-xs capitalize font-medium ${risk.text}`}>{log.riskLevel} risk</span>
                {attachments.length > 0 && (
                  <span className="text-xs text-ink-muted flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />{attachments.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-1 line-clamp-2">{log.summary}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(log.logDate).toLocaleDateString()}</span>
                {log.author      && <span className="flex items-center gap-1"><User className="w-3 h-3" />{log.author}</span>}
                {log.siteLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{log.siteLocation}</span>}
                {log.weather     && <span className="flex items-center gap-1"><Cloud className="w-3 h-3" />{log.weather}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {delays.length > 0  && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{delays.length} delay{delays.length>1?'s':''}</span>}
              {actions.length > 0 && <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full">{actions.length} action{actions.length>1?'s':''}</span>}
              {expanded ? <ChevronUp className="w-4 h-4 text-ink-muted" /> : <ChevronDown className="w-4 h-4 text-ink-muted" />}
            </div>
          </div>
        </div>

        {/* Expanded body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 pt-3 border-t border-white/5 space-y-4">
                {delays.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1.5">Delays</div>
                    <ul className="space-y-1">
                      {delays.map((d, i) => (
                        <li key={i} className="text-xs text-ink-muted flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />{d.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {contractors.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-1.5">Contractors On Site</div>
                    <div className="flex flex-wrap gap-2">
                      {contractors.map((c, i) => (
                        <span key={i} className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}
                {risks.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1.5">Risk Flags</div>
                    <ul className="space-y-1">
                      {risks.map((r, i) => (
                        <li key={i} className="text-xs text-ink-muted flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${r.level==='high'?'bg-red-400':'bg-amber-400'}`} />{r.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {actions.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1.5">Action Items</div>
                    <ul className="space-y-1">
                      {actions.map((a, i) => (
                        <li key={i} className="text-xs text-ink-muted flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-brand-400 mt-0.5 shrink-0" />{a.task}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Photo attachments */}
                {attachments.length > 0 && (
                  <PhotoGrid attachments={attachments} onOpen={(i) => setLightboxIdx(i)} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {lightboxIdx !== null && (
        <Lightbox images={attachments} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
}

// ── Photo drop zone component ─────────────────────────────────────────────────
function PhotoDropZone({ photos, onAdd, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    onAdd(imgs);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-ink-muted flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          Site Photos
          <span className="text-ink-muted/50">({photos.length}/10)</span>
        </label>
        {photos.length > 0 && (
          <button onClick={() => onAdd([])} className="text-xs text-ink-muted hover:text-red-400 transition-colors">Clear all</button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all py-4 px-4 text-center ${
          dragging ? 'border-brand-400 bg-brand-500/10' : 'border-rim hover:border-brand-500/50 hover:bg-surface/50'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-surface border border-rim flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <div className="text-sm text-white/70 font-medium">Drop photos here or click to browse</div>
              <div className="text-xs text-ink-muted mt-0.5">JPG, PNG, HEIC — up to 10 files, 15 MB each</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <ImageIcon className="w-4 h-4 text-brand-400" />
            <span className="text-brand-400 font-medium">{photos.length} photo{photos.length>1?'s':''} selected</span>
            <span>— click to add more</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={p.previewUrl} alt="" className="w-full h-full object-cover rounded-lg border border-rim" />
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5">
                <div className="text-[9px] text-white/70 truncate">{(p.file.size / (1024*1024)).toFixed(2)} MiB</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── New Log Modal ─────────────────────────────────────────────────────────────
function NewLogModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    projectName: '',
    siteLocation: '',
    logDate: new Date().toISOString().slice(0, 10),
    author: '',
    weather: '',
    rawText: '',
  });
  const [photos, setPhotos]         = useState([]);
  const [aiPreview, setAiPreview]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [saveError, setSaveError]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAddPhotos = useCallback((files) => {
    if (!files.length) { setPhotos([]); return; }
    const newPhotos = files.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
  }, []);

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleAnalyze = async () => {
    if (!form.rawText.trim()) return;
    setAnalyzing(true);
    try {
      const res  = await fetch('/api/job-logs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rawText: form.rawText }),
      });
      setAiPreview(await res.json());
    } catch { /* ignore */ } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!form.projectName.trim() || !form.rawText.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      photos.forEach(p => fd.append('photos', p.file));

      const res  = await fetch('/api/job-logs', { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to save'); }
      onSave(await res.json());
      onClose();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ic = "w-full bg-canvas border border-rim rounded-lg px-3 py-2 text-sm text-white placeholder:text-ink-muted focus:border-brand-500 outline-none";

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-canvas border border-rim rounded-2xl w-full max-w-2xl shadow-float my-8"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rim sticky top-0 bg-canvas rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-white">New Site Log</span>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-white p-1 rounded-lg hover:bg-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body — full scroll */}
        <div className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Project Name <span className="text-red-400">*</span></label>
              <input className={ic} placeholder="e.g. 450 Highway #2" value={form.projectName} onChange={e => set('projectName', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Site Location</label>
              <input className={ic} placeholder="e.g. Level 3 East Wing" value={form.siteLocation} onChange={e => set('siteLocation', e.target.value)} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Log Date <span className="text-red-400">*</span></label>
              <input type="date" className={ic} value={form.logDate} onChange={e => set('logDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Author / Foreman</label>
              <input className={ic} placeholder="e.g. Rob Carlson" value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Weather</label>
              <input className={ic} placeholder="e.g. Rain 10°C" value={form.weather} onChange={e => set('weather', e.target.value)} />
            </div>
          </div>

          {/* Log content */}
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Log Content <span className="text-red-400">*</span></label>
            <textarea
              rows={7}
              className={ic + ' resize-none font-mono leading-relaxed'}
              placeholder={`Paste your site diary here.\n\nExample:\nWeather: Rain 10. ARCP off site due to rain.\nSiding guys not in due to rain. Reached out to Edwin at Skyrise for staging quote.\nDrywallers framed ceiling in level 2 corridor.\nTerry Sprinkler will have someone Monday to place heads in corridor ceilings.\nFlooring crew continue on level 3. Electricians installing baseboard receptacles.`}
              value={form.rawText}
              onChange={e => set('rawText', e.target.value)}
            />
          </div>

          {/* Photos */}
          <PhotoDropZone
            photos={photos}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
          />

          {/* AI preview */}
          {aiPreview && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-brand-500/5 border border-brand-500/20 p-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5" /> AI Analysis Preview
              </div>
              <p className="text-sm text-white/85">{aiPreview.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {aiPreview.riskLevel && (
                  <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${
                    aiPreview.riskLevel==='high'?'bg-red-500/20 text-red-400':
                    aiPreview.riskLevel==='medium'?'bg-amber-500/20 text-amber-400':
                    'bg-emerald-500/20 text-emerald-400'}`}>
                    {aiPreview.riskLevel} risk
                  </span>
                )}
                {aiPreview.delays?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{aiPreview.delays.length} delay{aiPreview.delays.length>1?'s':''}</span>}
                {aiPreview.actionItems?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">{aiPreview.actionItems.length} action{aiPreview.actionItems.length>1?'s':''}</span>}
                {aiPreview.contractors?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{aiPreview.contractors.length} contractor{aiPreview.contractors.length>1?'s':''}</span>}
              </div>
            </motion.div>
          )}

          {saveError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {saveError}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-rim flex items-center justify-between gap-3 sticky bottom-0 bg-canvas rounded-b-2xl">
          <button
            onClick={handleAnalyze}
            disabled={!form.rawText.trim() || analyzing}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 transition-colors disabled:opacity-40"
          >
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {analyzing ? 'Analyzing…' : 'Preview AI Analysis'}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-rim text-ink-muted text-sm hover:text-white transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!form.projectName.trim() || !form.rawText.trim() || saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Saving…' : `Save Log${photos.length ? ` + ${photos.length} Photo${photos.length>1?'s':''}` : ''}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function JobLogsPage() {
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [expanded, setExpanded]   = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)               params.set('project',   search);
      if (riskFilter !== 'All') params.set('riskLevel', riskFilter.toLowerCase());
      const res  = await fetch(`/api/job-logs?${params}`, { credentials: 'include' });
      const data = await res.json();
      setLogs(data.logs  || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [search, riskFilter]);

  const highCount   = logs.filter(l => l.riskLevel === 'high').length;
  const delayCount  = logs.reduce((s, l) => s + (Array.isArray(l.delays)      ? l.delays.length      : 0), 0);
  const actionCount = logs.reduce((s, l) => s + (Array.isArray(l.actionItems) ? l.actionItems.length : 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-brand-400" />
            </div>
            Site Reports
          </h1>
          <p className="text-ink-muted text-sm mt-1">Job logs with AI-powered delay and risk detection + photo attachments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Log
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs',   value: total,       icon: FileText,      color: 'text-white' },
          { label: 'High Risk',    value: highCount,   icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Delays Found', value: delayCount,  icon: Clock,         color: 'text-amber-400' },
          { label: 'Action Items', value: actionCount, icon: CheckCircle2,  color: 'text-brand-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label} className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-ink-muted">{label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            className="w-full pl-9 pr-3 py-2 bg-surface border border-rim rounded-lg text-sm text-white placeholder:text-ink-muted focus:border-brand-500 outline-none"
            placeholder="Search by project name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-surface border border-rim rounded-lg p-1">
          {['All','High','Medium','Low'].map(tab => (
            <button
              key={tab}
              onClick={() => setRiskFilter(tab)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                riskFilter===tab ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-ink-muted hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button onClick={fetchLogs} className="p-2 rounded-lg border border-rim text-ink-muted hover:text-white hover:border-brand-500/40 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Logs list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="rounded-xl bg-surface border border-rim h-24 animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-12 h-12 text-ink-muted/30 mx-auto mb-4" />
          <div className="text-white/60 font-medium">No site logs yet</div>
          <p className="text-ink-muted text-sm mt-1">Click "New Log" to record your first site diary entry with photos</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {logs.map(log => (
              <LogCard
                key={log.id}
                log={log}
                expanded={expanded === log.id}
                onExpand={id => setExpanded(p => p === id ? null : id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && <NewLogModal onClose={() => setShowModal(false)} onSave={log => { setLogs(p => [log, ...p]); setTotal(t => t+1); }} />}
    </div>
  );
}
