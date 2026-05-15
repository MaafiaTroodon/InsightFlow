import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Plus, Trash2, Eye, X, FileSpreadsheet,
  CheckCircle2, Building2, User, Hash, Calendar, DollarSign,
  Printer, ChevronRight, Upload, Zap, Loader2, ArrowRight,
} from 'lucide-react';
import { GlassCard, CardHeader, CardBody } from '../components/ui/GlassCard';

// ── Templates ─────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'construction',
    name: 'Construction Invoice',
    desc: 'Labour + materials + equipment breakdown',
    accent: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    icon: Building2,
    defaultLineItems: [
      { desc: 'Labour — General Construction', qty: 40, unit: 'hrs', rate: 85 },
      { desc: 'Materials — Concrete & Steel',  qty: 1,  unit: 'lot', rate: 4200 },
      { desc: 'Equipment Hire',                qty: 3,  unit: 'days', rate: 650 },
    ],
  },
  {
    id: 'progress',
    name: 'Progress Claim',
    desc: 'Milestone billing with holdback',
    accent: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    icon: CheckCircle2,
    defaultLineItems: [
      { desc: 'Progress Claim #1 — Foundation Works', qty: 1, unit: 'lot', rate: 85000 },
      { desc: 'Less: 10% Holdback',                   qty: 1, unit: 'lot', rate: -8500 },
    ],
  },
  {
    id: 'materials',
    name: 'Materials Invoice',
    desc: 'Supply of construction materials',
    accent: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    icon: FileText,
    defaultLineItems: [
      { desc: '100mm Concrete Block (per unit)', qty: 500, unit: 'ea',  rate: 3.20 },
      { desc: 'Steel Reinforcement Bar 12mm',    qty: 20,  unit: 'ton', rate: 1100 },
      { desc: 'Ready-Mix Concrete',              qty: 15,  unit: 'm³',  rate: 220  },
    ],
  },
  {
    id: 'labour',
    name: 'Labour Invoice',
    desc: 'Time and attendance billing',
    accent: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    icon: User,
    defaultLineItems: [
      { desc: 'Site Supervisor',    qty: 40, unit: 'hrs', rate: 120 },
      { desc: 'General Labourer',   qty: 80, unit: 'hrs', rate: 65  },
      { desc: 'Skilled Tradesperson', qty: 60, unit: 'hrs', rate: 95 },
    ],
  },
  {
    id: 'subcontractor',
    name: 'Subcontractor Invoice',
    desc: 'Subcontract works package billing',
    accent: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    icon: Hash,
    defaultLineItems: [
      { desc: 'Electrical Rough-In — Level 2', qty: 1, unit: 'lot', rate: 18500 },
      { desc: 'Variation #3 — Additional Circuits', qty: 1, unit: 'lot', rate: 2200 },
    ],
  },
  {
    id: 'service',
    name: 'Service Invoice',
    desc: 'Maintenance, inspection & service',
    accent: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    icon: Zap,
    defaultLineItems: [
      { desc: 'Site Safety Inspection', qty: 1,  unit: 'visit', rate: 750 },
      { desc: 'Monthly Site Clean',     qty: 4,  unit: 'wks',   rate: 380 },
      { desc: 'Equipment Service',      qty: 1,  unit: 'lot',   rate: 1200 },
    ],
  },
];

// ── Invoice state helpers ──────────────────────────────────────────────────────
const blankItem = () => ({ id: Date.now(), desc: '', qty: 1, unit: 'ea', rate: 0 });

const blankInvoice = (template) => ({
  invoiceNo:     `INV-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  date:          new Date().toISOString().slice(0, 10),
  dueDate:       new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  fromName:      '',
  fromAddress:   '',
  fromEmail:     '',
  fromPhone:     '',
  toName:        '',
  toAddress:     '',
  toEmail:       '',
  projectRef:    '',
  poNumber:      '',
  taxRate:       10,
  notes:         'Payment due within 30 days. Please reference invoice number on payment.',
  lineItems:     template.defaultLineItems.map((li, i) => ({ ...li, id: i })),
});

// ── Calculation ────────────────────────────────────────────────────────────────
const calcInvoice = (inv) => {
  const subtotal = inv.lineItems.reduce((s, li) => s + Number(li.qty) * Number(li.rate), 0);
  const tax      = subtotal > 0 ? subtotal * (Number(inv.taxRate) / 100) : 0;
  const total    = subtotal + tax;
  return { subtotal, tax, total };
};

// ── Invoice HTML for export ────────────────────────────────────────────────────
const buildInvoiceHtml = (inv, templateName) => {
  const { subtotal, tax, total } = calcInvoice(inv);
  const fmt = (n) => `$${Number(n).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceNo}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#1e293b; background:#fff; font-size:13px; }
  .page { max-width:800px; margin:0 auto; padding:48px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
  .brand { display:flex; align-items:center; gap:10px; }
  .logo-box { width:40px; height:40px; background:#0d9488; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .logo-box span { color:#fff; font-weight:900; font-size:16px; }
  .brand-name { font-size:18px; font-weight:800; color:#0f172a; }
  .brand-sub  { font-size:10px; color:#64748b; margin-top:1px; }
  .inv-title  { text-align:right; }
  .inv-title h1 { font-size:28px; font-weight:900; color:#0f172a; letter-spacing:-0.5px; }
  .inv-title .num { font-size:13px; color:#0d9488; font-weight:600; margin-top:4px; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; }
  .meta-block label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; display:block; margin-bottom:6px; }
  .meta-block .val { font-size:14px; font-weight:600; color:#0f172a; line-height:1.5; }
  .meta-block .sub { font-size:12px; color:#64748b; margin-top:2px; line-height:1.4; }
  .dates { display:flex; gap:32px; margin-bottom:32px; padding:16px 20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; }
  .date-item label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; display:block; margin-bottom:4px; }
  .date-item .val { font-size:13px; font-weight:600; color:#0f172a; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead th { background:#0f172a; color:#fff; padding:10px 14px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; text-align:left; }
  thead th:last-child, thead th:nth-last-child(-n+2) { text-align:right; }
  tbody tr { border-bottom:1px solid #f1f5f9; }
  tbody tr:last-child { border-bottom:none; }
  tbody td { padding:12px 14px; font-size:13px; color:#1e293b; }
  tbody td:last-child, tbody td:nth-last-child(-n+2) { text-align:right; }
  .totals { display:flex; justify-content:flex-end; }
  .totals-box { width:280px; }
  .totals-row { display:flex; justify-content:space-between; padding:8px 0; font-size:13px; border-bottom:1px solid #f1f5f9; }
  .totals-row.total { font-size:16px; font-weight:800; color:#0f172a; border-bottom:none; border-top:2px solid #0f172a; padding-top:12px; margin-top:4px; }
  .totals-row.total span:last-child { color:#0d9488; }
  .notes { margin-top:32px; padding:16px 20px; background:#f0fdfa; border-radius:12px; border:1px solid #99f6e4; }
  .notes label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#0d9488; display:block; margin-bottom:6px; }
  .notes p { font-size:12px; color:#0f766e; line-height:1.5; }
  .footer { margin-top:40px; text-align:center; font-size:11px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:20px; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="logo-box"><span>IF</span></div>
      <div>
        <div class="brand-name">${inv.fromName || 'Your Company'}</div>
        <div class="brand-sub">Generated by InsightFlow</div>
      </div>
    </div>
    <div class="inv-title">
      <h1>INVOICE</h1>
      <div class="num">${inv.invoiceNo}</div>
      ${inv.projectRef ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">Project: ${inv.projectRef}</div>` : ''}
      ${inv.poNumber   ? `<div style="font-size:12px;color:#64748b;">PO: ${inv.poNumber}</div>` : ''}
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <label>From</label>
      <div class="val">${inv.fromName || '—'}</div>
      <div class="sub">${(inv.fromAddress || '').replace(/\n/g,'<br>')}</div>
      ${inv.fromEmail ? `<div class="sub">${inv.fromEmail}</div>` : ''}
      ${inv.fromPhone ? `<div class="sub">${inv.fromPhone}</div>` : ''}
    </div>
    <div class="meta-block">
      <label>Bill To</label>
      <div class="val">${inv.toName || '—'}</div>
      <div class="sub">${(inv.toAddress || '').replace(/\n/g,'<br>')}</div>
      ${inv.toEmail ? `<div class="sub">${inv.toEmail}</div>` : ''}
    </div>
  </div>

  <div class="dates">
    <div class="date-item"><label>Invoice Date</label><div class="val">${inv.date}</div></div>
    <div class="date-item"><label>Due Date</label><div class="val">${inv.dueDate}</div></div>
    <div class="date-item"><label>Type</label><div class="val">${templateName}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:45%">Description</th>
        <th style="width:10%;text-align:right">Qty</th>
        <th style="width:10%;text-align:center">Unit</th>
        <th style="width:17%;text-align:right">Rate</th>
        <th style="width:18%;text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${inv.lineItems.map(li => `
      <tr>
        <td>${li.desc || '—'}</td>
        <td style="text-align:right">${li.qty}</td>
        <td style="text-align:center">${li.unit}</td>
        <td style="text-align:right">${fmt(li.rate)}</td>
        <td style="text-align:right;font-weight:600">${fmt(Number(li.qty) * Number(li.rate))}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      ${Number(inv.taxRate) > 0 ? `<div class="totals-row"><span>GST/Tax (${inv.taxRate}%)</span><span>${fmt(tax)}</span></div>` : ''}
      <div class="totals-row total"><span>Total Due</span><span>${fmt(total)}</span></div>
    </div>
  </div>

  ${inv.notes ? `<div class="notes"><label>Notes &amp; Payment Terms</label><p>${inv.notes}</p></div>` : ''}

  <div class="footer">
    Generated by InsightFlow · ${inv.invoiceNo} · ${inv.date}
  </div>
</div>
</body>
</html>`;
};

// ── Export helpers ─────────────────────────────────────────────────────────────
const exportPDF = (inv, templateName) => {
  const html = buildInvoiceHtml(inv, templateName);
  const win  = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
};

const exportCSV = (inv) => {
  const { subtotal, tax, total } = calcInvoice(inv);
  const rows = [
    ['Invoice No', inv.invoiceNo],
    ['Date', inv.date],
    ['Due Date', inv.dueDate],
    ['From', inv.fromName],
    ['To', inv.toName],
    ['Project', inv.projectRef],
    [],
    ['Description', 'Qty', 'Unit', 'Rate', 'Amount'],
    ...inv.lineItems.map(li => [li.desc, li.qty, li.unit, li.rate, (Number(li.qty)*Number(li.rate)).toFixed(2)]),
    [],
    ['Subtotal', '', '', '', subtotal.toFixed(2)],
    [`Tax (${inv.taxRate}%)`, '', '', '', tax.toFixed(2)],
    ['Total', '', '', '', total.toFixed(2)],
  ];
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a   = document.createElement('a');
  a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `${inv.invoiceNo}.csv`;
  a.click();
};

const exportWord = (inv, templateName) => {
  const html = buildInvoiceHtml(inv, templateName);
  const a    = document.createElement('a');
  a.href     = 'data:application/msword;charset=utf-8,' + encodeURIComponent(html);
  a.download = `${inv.invoiceNo}.doc`;
  a.click();
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function TemplateCard({ tmpl, selected, onClick }) {
  const Icon = tmpl.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-left rounded-xl border p-4 transition-all cursor-pointer w-full ${
        selected
          ? 'bg-brand-500/15 border-brand-500/50 ring-1 ring-brand-500/40'
          : 'bg-surface border-rim hover:border-brand-500/30'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${tmpl.accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-sm font-semibold text-white">{tmpl.name}</div>
      <div className="text-xs text-ink-muted mt-1">{tmpl.desc}</div>
    </motion.button>
  );
}

function LineItemRow({ item, onChange, onRemove }) {
  const total = Number(item.qty) * Number(item.rate);
  return (
    <div className="grid grid-cols-[1fr_80px_70px_100px_100px_32px] gap-2 items-center">
      <input
        className="bg-canvas border border-rim rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-ink-muted focus:border-brand-500 outline-none"
        placeholder="Description"
        value={item.desc}
        onChange={e => onChange({ ...item, desc: e.target.value })}
      />
      <input type="number" min="0" className="bg-canvas border border-rim rounded-lg px-2 py-1.5 text-sm text-white text-right focus:border-brand-500 outline-none" value={item.qty} onChange={e => onChange({ ...item, qty: e.target.value })} />
      <input className="bg-canvas border border-rim rounded-lg px-2 py-1.5 text-sm text-white focus:border-brand-500 outline-none" placeholder="ea" value={item.unit} onChange={e => onChange({ ...item, unit: e.target.value })} />
      <input type="number" min="0" className="bg-canvas border border-rim rounded-lg px-2 py-1.5 text-sm text-white text-right focus:border-brand-500 outline-none" value={item.rate} onChange={e => onChange({ ...item, rate: e.target.value })} />
      <div className="text-sm text-white font-mono text-right pr-1">
        ${total < 0 ? '-' : ''}{Math.abs(total).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
      </div>
      <button onClick={onRemove} className="text-ink-muted hover:text-red-400 transition-colors flex items-center justify-center">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function PdfConverterPanel() {
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (f) => {
    if (!f || f.type !== 'application/pdf') { setError('Please select a PDF file.'); return; }
    setFile(f); setError(null); setResult(null); setLoading(true);
    const fd = new FormData();
    fd.append('file', f);
    try {
      const res  = await fetch('/api/pdf/extract', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const exportFromPdf = () => {
    if (!result) return;
    const f = result.fields || {};
    const inv = {
      invoiceNo:   f.invoiceNumber || `INV-${Date.now()}`,
      date:        f.invoiceDate   || new Date().toISOString().slice(0,10),
      dueDate:     f.dueDate       || '',
      fromName:    f.vendorName    || '',
      fromAddress: '', fromEmail: '', fromPhone: '',
      toName:      f.clientName    || '',
      toAddress: '', toEmail: '',
      projectRef:  f.projectName   || '',
      poNumber:    f.poNumber      || '',
      taxRate:     10,
      notes:       'Generated by InsightFlow PDF Intelligence.',
      lineItems:   result.lineItems?.length
        ? result.lineItems.map((li, i) => ({ id: i, desc: li.description, qty: 1, unit: 'lot', rate: li.amount }))
        : [{ id: 0, desc: result.summary || 'Services rendered', qty: 1, unit: 'lot', rate: f.totalAmount || 0 }],
    };
    exportPDF(inv, result.docType || 'Invoice');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">Upload any PDF (quote, receipt, statement) and convert it to an InsightFlow-branded invoice.</p>

      <div
        onClick={() => fileRef.current?.click()}
        className="rounded-xl border-2 border-dashed border-rim hover:border-brand-500/50 cursor-pointer py-8 text-center transition-colors"
      >
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            <span className="text-sm text-ink-muted">Extracting fields…</span>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-1">
            <FileText className="w-8 h-8 text-brand-400" />
            <span className="text-sm font-medium text-white">{file.name}</span>
            <span className="text-xs text-ink-muted">Click to change</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-ink-muted/40" />
            <span className="text-sm text-ink-muted">Click to upload PDF</span>
          </div>
        )}
      </div>

      {error && <div className="text-xs text-red-400 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-brand-500/5 border border-brand-500/20 p-4 space-y-3">
          <div className="text-xs font-semibold text-brand-400 uppercase tracking-wide flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Extracted — {result.overallConfidence}% confidence
          </div>
          <p className="text-sm text-white/80">{result.summary}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {result.fields?.vendorName    && <div><span className="text-ink-muted">From: </span><span className="text-white">{result.fields.vendorName}</span></div>}
            {result.fields?.totalAmount   && <div><span className="text-ink-muted">Total: </span><span className="text-white">${Number(result.fields.totalAmount).toLocaleString()}</span></div>}
            {result.fields?.invoiceDate   && <div><span className="text-ink-muted">Date: </span><span className="text-white">{result.fields.invoiceDate}</span></div>}
            {result.fields?.projectName   && <div><span className="text-ink-muted">Project: </span><span className="text-white">{result.fields.projectName}</span></div>}
          </div>
          <button
            onClick={exportFromPdf}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Export as Branded Invoice PDF
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function InvoiceGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [invoice, setInvoice]   = useState(() => blankInvoice(TEMPLATES[0]));
  const [activeTab, setActiveTab] = useState('templates');
  const [showPreview, setShowPreview] = useState(false);

  const { subtotal, tax, total } = calcInvoice(invoice);
  const fmt = (n) => `$${Number(n).toLocaleString('en-AU', { minimumFractionDigits: 2 })}`;

  const pickTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setInvoice(blankInvoice(tmpl));
  };

  const setField = (k, v) => setInvoice(inv => ({ ...inv, [k]: v }));

  const updateItem = (id, updated) =>
    setInvoice(inv => ({ ...inv, lineItems: inv.lineItems.map(li => li.id === id ? updated : li) }));

  const removeItem = (id) =>
    setInvoice(inv => ({ ...inv, lineItems: inv.lineItems.filter(li => li.id !== id) }));

  const addItem = () =>
    setInvoice(inv => ({ ...inv, lineItems: [...inv.lineItems, blankItem()] }));

  const inputClass = "w-full bg-canvas border border-rim rounded-lg px-3 py-2 text-sm text-white placeholder:text-ink-muted focus:border-brand-500 outline-none";
  const labelClass = "text-xs text-ink-muted mb-1 block";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            Invoice Builder
          </h1>
          <p className="text-ink-muted text-sm mt-1">Generate professional invoices — export as PDF, Excel, or Word</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rim text-ink-muted hover:text-white hover:border-brand-500/40 text-sm transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() => exportPDF(invoice, selectedTemplate.name)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => exportCSV(invoice)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => exportWord(invoice, selectedTemplate.name)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 text-sm transition-colors"
          >
            <FileText className="w-4 h-4" /> Word
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-surface border border-rim rounded-xl p-1 w-fit">
        {[
          { id: 'templates', label: 'Templates' },
          { id: 'details',   label: 'Invoice Details' },
          { id: 'convert',   label: 'PDF Converter' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-ink-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div>
              <p className="text-sm text-ink-muted mb-4">Choose a template to pre-fill line items. You can edit everything after selecting.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {TEMPLATES.map(tmpl => (
                  <TemplateCard
                    key={tmpl.id}
                    tmpl={tmpl}
                    selected={selectedTemplate.id === tmpl.id}
                    onClick={() => pickTemplate(tmpl)}
                  />
                ))}
              </div>
            </div>

            <GlassCard>
              <CardHeader icon={CheckCircle2} title={`Selected: ${selectedTemplate.name}`} accent="brand" action={
                <button onClick={() => setActiveTab('details')} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                  Edit details <ChevronRight className="w-3 h-3" />
                </button>
              } />
              <CardBody>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_80px_70px_100px_100px_32px] gap-2 text-xs text-ink-muted font-semibold uppercase tracking-wide px-0.5 mb-1">
                    <span>Description</span><span className="text-right">Qty</span><span>Unit</span><span className="text-right">Rate</span><span className="text-right">Amount</span><span />
                  </div>
                  {invoice.lineItems.map(li => (
                    <LineItemRow
                      key={li.id}
                      item={li}
                      onChange={updated => updateItem(li.id, updated)}
                      onRemove={() => removeItem(li.id)}
                    />
                  ))}
                  <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add line item
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-rim flex justify-end">
                  <div className="w-56 space-y-2 text-sm">
                    <div className="flex justify-between text-ink-muted">
                      <span>Subtotal</span><span className="text-white">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ink-muted">
                      <span>Tax ({invoice.taxRate}%)</span><span className="text-white">{fmt(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white border-t border-rim pt-2">
                      <span>Total</span><span className="text-brand-400">{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Invoice meta */}
              <GlassCard>
                <CardHeader icon={Hash} title="Invoice Details" accent="brand" />
                <CardBody>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClass}>Invoice No.</label><input className={inputClass} value={invoice.invoiceNo} onChange={e => setField('invoiceNo', e.target.value)} /></div>
                      <div><label className={labelClass}>Tax Rate (%)</label><input type="number" className={inputClass} value={invoice.taxRate} onChange={e => setField('taxRate', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClass}>Invoice Date</label><input type="date" className={inputClass} value={invoice.date} onChange={e => setField('date', e.target.value)} /></div>
                      <div><label className={labelClass}>Due Date</label><input type="date" className={inputClass} value={invoice.dueDate} onChange={e => setField('dueDate', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelClass}>Project / Job Ref</label><input className={inputClass} placeholder="e.g. Harbor Bridge Ph.2" value={invoice.projectRef} onChange={e => setField('projectRef', e.target.value)} /></div>
                      <div><label className={labelClass}>PO Number</label><input className={inputClass} placeholder="e.g. PO-12345" value={invoice.poNumber} onChange={e => setField('poNumber', e.target.value)} /></div>
                    </div>
                    <div><label className={labelClass}>Notes / Payment Terms</label>
                      <textarea rows={3} className={inputClass + ' resize-none'} value={invoice.notes} onChange={e => setField('notes', e.target.value)} />
                    </div>
                  </div>
                </CardBody>
              </GlassCard>

              {/* Right: From / To */}
              <div className="space-y-4">
                <GlassCard>
                  <CardHeader icon={Building2} title="From (Your Company)" accent="sky" />
                  <CardBody>
                    <div className="space-y-3">
                      <div><label className={labelClass}>Company / Name</label><input className={inputClass} placeholder="Your company name" value={invoice.fromName} onChange={e => setField('fromName', e.target.value)} /></div>
                      <div><label className={labelClass}>Address</label><textarea rows={2} className={inputClass + ' resize-none'} placeholder="Street, City, State" value={invoice.fromAddress} onChange={e => setField('fromAddress', e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={invoice.fromEmail} onChange={e => setField('fromEmail', e.target.value)} /></div>
                        <div><label className={labelClass}>Phone</label><input className={inputClass} type="tel" value={invoice.fromPhone} onChange={e => setField('fromPhone', e.target.value)} /></div>
                      </div>
                    </div>
                  </CardBody>
                </GlassCard>

                <GlassCard>
                  <CardHeader icon={User} title="Bill To (Client)" accent="gold" />
                  <CardBody>
                    <div className="space-y-3">
                      <div><label className={labelClass}>Client / Company</label><input className={inputClass} placeholder="Client name" value={invoice.toName} onChange={e => setField('toName', e.target.value)} /></div>
                      <div><label className={labelClass}>Address</label><textarea rows={2} className={inputClass + ' resize-none'} placeholder="Street, City, State" value={invoice.toAddress} onChange={e => setField('toAddress', e.target.value)} /></div>
                      <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={invoice.toEmail} onChange={e => setField('toEmail', e.target.value)} /></div>
                    </div>
                  </CardBody>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'convert' && (
          <motion.div key="convert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-xl">
              <GlassCard>
                <CardHeader icon={Upload} title="PDF → Invoice Converter" accent="violet" />
                <CardBody>
                  <PdfConverterPanel />
                </CardBody>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <span className="font-semibold text-gray-800">Preview — {invoice.invoiceNo}</span>
                <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: buildInvoiceHtml(invoice, selectedTemplate.name) }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
