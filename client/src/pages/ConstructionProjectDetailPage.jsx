import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createDeficiency, createRFI, createSafetyRecord, createScheduleItem,
  createSiteLog, createSubmittal, createTrade,
  deleteDeficiency, deleteRFI, deleteSafetyRecord, deleteScheduleItem,
  deleteSiteLog, deleteSubmittal, deleteTrade,
  fetchProject,
  updateDeficiency, updateProject, updateRFI, updateScheduleItem,
  updateSubmittal, updateTrade,
} from '../api/construction.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { Modal } from '../components/Modal.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20';
const selectCls = 'w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20';
const labelCls = 'mb-1.5 block text-sm font-semibold text-slate-300';

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ status, colorMap }) {
  const color = colorMap?.[status] || 'bg-white/10 text-slate-300';
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const map = { High: 'bg-rose-500/20 text-rose-300', Medium: 'bg-amber-500/20 text-amber-300', Low: 'bg-teal-500/20 text-teal-300' };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[priority] || 'bg-white/10 text-slate-300'}`}>{priority}</span>;
}

function DeleteBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300" title="Delete">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.712z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Institutional', 'Infrastructure', 'Renovation', 'Other'];
const STATUSES = ['Preconstruction', 'Active', 'On Hold', 'Completed'];
const STATUS_COLORS = {
  Active: 'bg-teal-500/20 text-teal-300',
  Completed: 'bg-emerald-500/20 text-emerald-300',
  'On Hold': 'bg-amber-500/20 text-amber-300',
  Preconstruction: 'bg-violet-500/20 text-violet-300',
};

function OverviewTab({ project, onProjectUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setForm({
      name: project.name || '',
      clientName: project.clientName || '',
      address: project.address || '',
      type: project.type || '',
      status: project.status || 'Active',
      budget: project.budget || '',
      contractValue: project.contractValue || '',
      percentComplete: project.percentComplete || 0,
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
      notes: project.notes || '',
    });
    setEditing(true);
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateProject(project.id, form);
      onProjectUpdated(updated);
      setEditing(false);
      toast.success('Project updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <Card className="p-6">
        <h3 className="mb-5 text-base font-bold text-white">Edit Project Details</h3>
        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Project Name *">
              <input value={form.name} onChange={set('name')} required className={inputCls} />
            </Field>
          </div>
          <Field label="Client Name">
            <input value={form.clientName} onChange={set('clientName')} className={inputCls} />
          </Field>
          <Field label="Project Type">
            <select value={form.type} onChange={set('type')} className={selectCls}>
              <option value="">Select...</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Site Address">
              <input value={form.address} onChange={set('address')} className={inputCls} />
            </Field>
          </div>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={selectCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="% Complete">
            <input type="number" min="0" max="100" value={form.percentComplete} onChange={set('percentComplete')} className={inputCls} />
          </Field>
          <Field label="Contract Value ($)">
            <input type="number" min="0" step="0.01" value={form.contractValue} onChange={set('contractValue')} className={inputCls} />
          </Field>
          <Field label="Budget ($)">
            <input type="number" min="0" step="0.01" value={form.budget} onChange={set('budget')} className={inputCls} />
          </Field>
          <Field label="Start Date">
            <input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} />
          </Field>
          <Field label="End Date">
            <input type="date" value={form.endDate} onChange={set('endDate')} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={3} className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Card>
    );
  }

  const pct = project.percentComplete || 0;

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-5 sm:col-span-2 xl:col-span-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Overall Progress</p>
          <p className="text-2xl font-extrabold text-white">{pct}% Complete</p>
        </div>
        <div className="flex-1 max-w-sm">
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
        <Button variant="secondary" onClick={startEdit}>Edit Project</Button>
      </Card>

      {project.contractValue && (
        <Card className="p-5">
          <p className="text-xs text-slate-400">Contract Value</p>
          <p className="mt-1 text-xl font-bold text-white">{formatCurrency(project.contractValue)}</p>
        </Card>
      )}
      {project.budget && (
        <Card className="p-5">
          <p className="text-xs text-slate-400">Budget</p>
          <p className="mt-1 text-xl font-bold text-white">{formatCurrency(project.budget)}</p>
        </Card>
      )}
      {project.startDate && (
        <Card className="p-5">
          <p className="text-xs text-slate-400">Start Date</p>
          <p className="mt-1 text-base font-bold text-white">{formatDate(project.startDate)}</p>
        </Card>
      )}
      {project.endDate && (
        <Card className="p-5">
          <p className="text-xs text-slate-400">End Date</p>
          <p className="mt-1 text-base font-bold text-white">{formatDate(project.endDate)}</p>
        </Card>
      )}

      <Card className="p-5 sm:col-span-2 xl:col-span-4">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {project.clientName && (
            <div><span className="text-slate-400">Client: </span><span className="text-white font-semibold">{project.clientName}</span></div>
          )}
          {project.address && (
            <div><span className="text-slate-400">Address: </span><span className="text-white font-semibold">{project.address}</span></div>
          )}
          {project.type && (
            <div><span className="text-slate-400">Type: </span><span className="text-white font-semibold">{project.type}</span></div>
          )}
          <div><span className="text-slate-400">Status: </span><StatusBadge status={project.status} colorMap={STATUS_COLORS} /></div>
        </div>
        {project.notes && (
          <p className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300 leading-relaxed">{project.notes}</p>
        )}
      </Card>
    </div>
  );
}

// ── Site Logs Tab ─────────────────────────────────────────────────────────────

function SiteLogsTab({ projectId, logs, onLogsChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', weather: '', temperature: '', workers: '', notes: '', createdBy: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const log = await createSiteLog(projectId, form);
      onLogsChange([log, ...logs]);
      setForm({ date: '', weather: '', temperature: '', workers: '', notes: '', createdBy: '' });
      setShowForm(false);
      toast.success('Site log added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSiteLog(projectId, toDelete.id);
      onLogsChange(logs.filter((l) => l.id !== toDelete.id));
      setToDelete(null);
      toast.success('Log deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Site Log'}</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Field label="Date *">
              <input type="date" value={form.date} onChange={set('date')} required className={inputCls} />
            </Field>
            <Field label="Created By">
              <input value={form.createdBy} onChange={set('createdBy')} placeholder="Name" className={inputCls} />
            </Field>
            <Field label="Weather">
              <input value={form.weather} onChange={set('weather')} placeholder="e.g. Sunny, 18°C" className={inputCls} />
            </Field>
            <Field label="Temperature">
              <input value={form.temperature} onChange={set('temperature')} placeholder="e.g. 18°C" className={inputCls} />
            </Field>
            <Field label="Workers on Site">
              <input type="number" min="0" value={form.workers} onChange={set('workers')} placeholder="0" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes / Work Completed">
                <textarea value={form.notes} onChange={set('notes')} rows={4} placeholder="Describe work performed, issues, observations..." className={`${inputCls} resize-none`} />
              </Field>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Log'}</Button>
            </div>
          </form>
        </Card>
      )}

      {logs.length === 0 ? (
        <EmptyState title="No site logs" description="Record daily site activity, weather, and work progress." />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-white">{formatDate(log.date)}</span>
                    {log.weather && <span className="text-sm text-slate-400">{log.weather}</span>}
                    {log.temperature && <span className="text-sm text-slate-400">{log.temperature}</span>}
                    {log.workers != null && <span className="text-sm text-slate-400">{log.workers} workers</span>}
                    {log.createdBy && <span className="text-xs text-slate-500">by {log.createdBy}</span>}
                  </div>
                  {log.notes && <p className="mt-2 text-sm text-slate-300 leading-relaxed">{log.notes}</p>}
                </div>
                <DeleteBtn onClick={() => setToDelete(log)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete site log" description="Remove this daily site log? This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}

// ── RFIs Tab ──────────────────────────────────────────────────────────────────

const RFI_STATUSES = ['Open', 'Answered', 'Closed'];
const RFI_STATUS_COLORS = { Open: 'bg-blue-500/20 text-blue-300', Answered: 'bg-teal-500/20 text-teal-300', Closed: 'bg-slate-500/20 text-slate-300' };

function RFIFormModal({ isOpen, onClose, onSave, initial, projectId }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({
    subject: '', description: '', status: 'Open', ballInCourt: '', submittedBy: '', assignedTo: '', dueDate: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        subject: initial.subject || '',
        description: initial.description || '',
        status: initial.status || 'Open',
        ballInCourt: initial.ballInCourt || '',
        submittedBy: initial.submittedBy || '',
        assignedTo: initial.assignedTo || '',
        dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ subject: '', description: '', status: 'Open', ballInCourt: '', submittedBy: '', assignedTo: '', dueDate: '' });
    }
  }, [initial, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = editing
        ? await updateRFI(projectId, initial.id, form)
        : await createRFI(projectId, form);
      onSave(result, editing);
      toast.success(editing ? 'RFI updated' : 'RFI created');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit RFI' : 'New RFI'}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Subject *">
              <input value={form.subject} onChange={set('subject')} required placeholder="Describe the request for information" className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Detailed description..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={selectCls}>
              {RFI_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Ball in Court">
            <input value={form.ballInCourt} onChange={set('ballInCourt')} placeholder="Who needs to respond?" className={inputCls} />
          </Field>
          <Field label="Submitted By">
            <input value={form.submittedBy} onChange={set('submittedBy')} placeholder="Name" className={inputCls} />
          </Field>
          <Field label="Assigned To">
            <input value={form.assignedTo} onChange={set('assignedTo')} placeholder="Name" className={inputCls} />
          </Field>
          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create RFI'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function RFIsTab({ projectId, rfis, onRFIsChange }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const handleSave = (rfi, isEdit) => {
    if (isEdit) onRFIsChange(rfis.map((r) => r.id === rfi.id ? rfi : r));
    else onRFIsChange([rfi, ...rfis]);
  };

  const handleDelete = async () => {
    try {
      await deleteRFI(projectId, toDelete.id);
      onRFIsChange(rfis.filter((r) => r.id !== toDelete.id));
      setToDelete(null);
      toast.success('RFI deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ New RFI</Button>
      </div>

      {rfis.length === 0 ? (
        <EmptyState title="No RFIs" description="Track requests for information, their status, and who needs to respond." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-slate-400">
                <th className="pb-3 pr-4 font-semibold">No.</th>
                <th className="pb-3 pr-4 font-semibold">Subject</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Ball in Court</th>
                <th className="pb-3 pr-4 font-semibold">Due Date</th>
                <th className="pb-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rfis.map((rfi) => (
                <tr key={rfi.id} className="group">
                  <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{rfi.number}</td>
                  <td className="py-3 pr-4 text-white font-medium max-w-xs truncate">{rfi.subject}</td>
                  <td className="py-3 pr-4"><StatusBadge status={rfi.status} colorMap={RFI_STATUS_COLORS} /></td>
                  <td className="py-3 pr-4 text-slate-400">{rfi.ballInCourt || '-'}</td>
                  <td className="py-3 pr-4 text-slate-400">{formatDate(rfi.dueDate)}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditing(rfi); setShowModal(true); }}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                          <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474zM4.75 7.5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" />
                          <path d="M3.5 3.75c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.75 14h-8.5A1.75 1.75 0 013.5 12.25v-8.5z" />
                        </svg>
                      </button>
                      <DeleteBtn onClick={() => setToDelete(rfi)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RFIFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editing} projectId={projectId} />
      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete RFI" description={`Delete "${toDelete?.number} — ${toDelete?.subject}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}

// ── Deficiencies Tab ──────────────────────────────────────────────────────────

const DEF_STATUS_COLORS = { Open: 'bg-rose-500/20 text-rose-300', 'In Progress': 'bg-amber-500/20 text-amber-300', Resolved: 'bg-teal-500/20 text-teal-300' };

function DeficiencyFormModal({ isOpen, onClose, onSave, initial, projectId }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({ description: '', location: '', trade: '', assignedTo: '', status: 'Open', priority: 'Medium', dueDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        description: initial.description || '',
        location: initial.location || '',
        trade: initial.trade || '',
        assignedTo: initial.assignedTo || '',
        status: initial.status || 'Open',
        priority: initial.priority || 'Medium',
        dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm({ description: '', location: '', trade: '', assignedTo: '', status: 'Open', priority: 'Medium', dueDate: '' });
    }
  }, [initial, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = editing
        ? await updateDeficiency(projectId, initial.id, form)
        : await createDeficiency(projectId, form);
      onSave(result, editing);
      toast.success(editing ? 'Deficiency updated' : 'Deficiency added');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit Deficiency' : 'New Deficiency'}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Description *">
              <textarea value={form.description} onChange={set('description')} required rows={3} placeholder="Describe the deficiency..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
          <Field label="Location">
            <input value={form.location} onChange={set('location')} placeholder="e.g. Level 3, Grid B-4" className={inputCls} />
          </Field>
          <Field label="Trade">
            <input value={form.trade} onChange={set('trade')} placeholder="e.g. Framing, Electrical" className={inputCls} />
          </Field>
          <Field label="Assigned To">
            <input value={form.assignedTo} onChange={set('assignedTo')} placeholder="Name or company" className={inputCls} />
          </Field>
          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={set('priority')} className={selectCls}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={selectCls}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Deficiency'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeficienciesTab({ projectId, deficiencies, onDeficienciesChange }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const handleSave = (def, isEdit) => {
    if (isEdit) onDeficienciesChange(deficiencies.map((d) => d.id === def.id ? def : d));
    else onDeficienciesChange([def, ...deficiencies]);
  };

  const handleDelete = async () => {
    try {
      await deleteDeficiency(projectId, toDelete.id);
      onDeficienciesChange(deficiencies.filter((d) => d.id !== toDelete.id));
      setToDelete(null);
      toast.success('Deficiency deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Deficiency</Button>
      </div>

      {deficiencies.length === 0 ? (
        <EmptyState title="No deficiencies" description="Track and assign trade deficiencies, including location and priority." />
      ) : (
        <div className="space-y-3">
          {deficiencies.map((def) => (
            <Card key={def.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-slate-400">{def.number}</span>
                    <StatusBadge status={def.status} colorMap={DEF_STATUS_COLORS} />
                    <PriorityBadge priority={def.priority} />
                    {def.trade && <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">{def.trade}</span>}
                  </div>
                  <p className="text-white text-sm leading-relaxed">{def.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    {def.location && <span>Location: {def.location}</span>}
                    {def.assignedTo && <span>Assigned: {def.assignedTo}</span>}
                    {def.dueDate && <span>Due: {formatDate(def.dueDate)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => { setEditing(def); setShowModal(true); }}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474z" />
                      <path d="M3.5 3.75c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.75 14h-8.5A1.75 1.75 0 013.5 12.25v-8.5z" />
                    </svg>
                  </button>
                  <DeleteBtn onClick={() => setToDelete(def)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeficiencyFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editing} projectId={projectId} />
      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete deficiency" description="Remove this deficiency record? This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}

// ── Safety Tab ────────────────────────────────────────────────────────────────

const SAFETY_TYPES = ['Site Inspection', 'Incident Report', 'Near Miss Report', 'Toolbox Talk', 'Emergency Contact', 'H&S Manual Update', 'Other'];
const SAFETY_TYPE_COLORS = {
  'Site Inspection': 'bg-blue-500/20 text-blue-300',
  'Incident Report': 'bg-rose-500/20 text-rose-300',
  'Near Miss Report': 'bg-amber-500/20 text-amber-300',
  'Toolbox Talk': 'bg-teal-500/20 text-teal-300',
  'Emergency Contact': 'bg-violet-500/20 text-violet-300',
  'H&S Manual Update': 'bg-slate-500/20 text-slate-300',
  'Other': 'bg-white/10 text-slate-300',
};

function SafetyTab({ projectId, safetyRecords, onSafetyChange }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', title: '', description: '', date: '', recordedBy: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const record = await createSafetyRecord(projectId, form);
      onSafetyChange([record, ...safetyRecords]);
      setForm({ type: '', title: '', description: '', date: '', recordedBy: '', status: '' });
      setShowForm(false);
      toast.success('Safety record added');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSafetyRecord(projectId, toDelete.id);
      onSafetyChange(safetyRecords.filter((r) => r.id !== toDelete.id));
      setToDelete(null);
      toast.success('Record deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Safety Record'}</Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <Field label="Type *">
              <select value={form.type} onChange={set('type')} required className={selectCls}>
                <option value="">Select type...</option>
                {SAFETY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Date *">
              <input type="date" value={form.date} onChange={set('date')} required className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Title *">
                <input value={form.title} onChange={set('title')} required placeholder="e.g. Weekly Safety Inspection — Level 4" className={inputCls} />
              </Field>
            </div>
            <Field label="Recorded By">
              <input value={form.recordedBy} onChange={set('recordedBy')} placeholder="Name" className={inputCls} />
            </Field>
            <Field label="Status">
              <input value={form.status} onChange={set('status')} placeholder="e.g. Completed, Follow-up Required" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description / Notes">
                <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Details, findings, actions taken..." className={`${inputCls} resize-none`} />
              </Field>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Record'}</Button>
            </div>
          </form>
        </Card>
      )}

      {safetyRecords.length === 0 ? (
        <EmptyState title="No safety records" description="Log site inspections, incidents, near misses, toolbox talks, and emergency contacts." />
      ) : (
        <div className="space-y-3">
          {safetyRecords.map((record) => (
            <Card key={record.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusBadge status={record.type} colorMap={SAFETY_TYPE_COLORS} />
                    <span className="text-xs text-slate-400">{formatDate(record.date)}</span>
                    {record.status && <span className="text-xs text-slate-500">{record.status}</span>}
                  </div>
                  <p className="font-semibold text-white text-sm">{record.title}</p>
                  {record.description && <p className="mt-1 text-sm text-slate-400 leading-relaxed">{record.description}</p>}
                  {record.recordedBy && <p className="mt-1 text-xs text-slate-500">Recorded by: {record.recordedBy}</p>}
                </div>
                <DeleteBtn onClick={() => setToDelete(record)} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete safety record" description="Remove this safety record? This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}

// ── Submittals Tab ────────────────────────────────────────────────────────────

const SUB_STATUS_COLORS = {
  Pending: 'bg-amber-500/20 text-amber-300',
  Submitted: 'bg-blue-500/20 text-blue-300',
  Approved: 'bg-teal-500/20 text-teal-300',
  Rejected: 'bg-rose-500/20 text-rose-300',
  Resubmit: 'bg-violet-500/20 text-violet-300',
};
const SUBMITTAL_STATUSES = ['Pending', 'Submitted', 'Approved', 'Rejected', 'Resubmit'];
const SUBMITTAL_TYPES = ['Shop Drawing', 'Material Sample', 'Product Data', 'Calculation', 'Certificate', 'Mock-up', 'Other'];

function SubmittalFormModal({ isOpen, onClose, onSave, initial, projectId }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({ title: '', trade: '', type: '', status: 'Pending', submittedBy: '', reviewedBy: '', submittedAt: '', reviewedAt: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        trade: initial.trade || '',
        type: initial.type || '',
        status: initial.status || 'Pending',
        submittedBy: initial.submittedBy || '',
        reviewedBy: initial.reviewedBy || '',
        submittedAt: initial.submittedAt ? initial.submittedAt.slice(0, 10) : '',
        reviewedAt: initial.reviewedAt ? initial.reviewedAt.slice(0, 10) : '',
        notes: initial.notes || '',
      });
    } else {
      setForm({ title: '', trade: '', type: '', status: 'Pending', submittedBy: '', reviewedBy: '', submittedAt: '', reviewedAt: '', notes: '' });
    }
  }, [initial, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = editing
        ? await updateSubmittal(projectId, initial.id, form)
        : await createSubmittal(projectId, form);
      onSave(result, editing);
      toast.success(editing ? 'Submittal updated' : 'Submittal created');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit Submittal' : 'New Submittal'}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title *">
              <input value={form.title} onChange={set('title')} required placeholder="e.g. Structural Steel Shop Drawings" className={inputCls} />
            </Field>
          </div>
          <Field label="Trade">
            <input value={form.trade} onChange={set('trade')} placeholder="e.g. Structural Steel" className={inputCls} />
          </Field>
          <Field label="Type">
            <select value={form.type} onChange={set('type')} className={selectCls}>
              <option value="">Select...</option>
              {SUBMITTAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={selectCls}>
              {SUBMITTAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Submitted By">
            <input value={form.submittedBy} onChange={set('submittedBy')} placeholder="Name" className={inputCls} />
          </Field>
          <Field label="Submitted Date">
            <input type="date" value={form.submittedAt} onChange={set('submittedAt')} className={inputCls} />
          </Field>
          <Field label="Reviewed By">
            <input value={form.reviewedBy} onChange={set('reviewedBy')} placeholder="Name" className={inputCls} />
          </Field>
          <Field label="Reviewed Date">
            <input type="date" value={form.reviewedAt} onChange={set('reviewedAt')} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Review comments, revision notes..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Submittal'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function SubmittalsTab({ projectId, submittals, onSubmittalsChange }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const handleSave = (sub, isEdit) => {
    if (isEdit) onSubmittalsChange(submittals.map((s) => s.id === sub.id ? sub : s));
    else onSubmittalsChange([sub, ...submittals]);
  };

  const handleDelete = async () => {
    try {
      await deleteSubmittal(projectId, toDelete.id);
      onSubmittalsChange(submittals.filter((s) => s.id !== toDelete.id));
      setToDelete(null);
      toast.success('Submittal deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ New Submittal</Button>
      </div>

      {submittals.length === 0 ? (
        <EmptyState title="No submittals" description="Track shop drawings, material samples, product data, and other submittal items." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-slate-400">
                <th className="pb-3 pr-4 font-semibold">No.</th>
                <th className="pb-3 pr-4 font-semibold">Title</th>
                <th className="pb-3 pr-4 font-semibold">Trade</th>
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Submitted</th>
                <th className="pb-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submittals.map((sub) => (
                <tr key={sub.id} className="group">
                  <td className="py-3 pr-4 text-slate-400 font-mono text-xs">{sub.number}</td>
                  <td className="py-3 pr-4 text-white font-medium max-w-[12rem] truncate">{sub.title}</td>
                  <td className="py-3 pr-4 text-slate-400">{sub.trade || '-'}</td>
                  <td className="py-3 pr-4 text-slate-400">{sub.type || '-'}</td>
                  <td className="py-3 pr-4"><StatusBadge status={sub.status} colorMap={SUB_STATUS_COLORS} /></td>
                  <td className="py-3 pr-4 text-slate-400">{formatDate(sub.submittedAt)}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditing(sub); setShowModal(true); }}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                          <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474z" />
                          <path d="M3.5 3.75c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.75 14h-8.5A1.75 1.75 0 013.5 12.25v-8.5z" />
                        </svg>
                      </button>
                      <DeleteBtn onClick={() => setToDelete(sub)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubmittalFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editing} projectId={projectId} />
      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete submittal" description={`Delete "${toDelete?.number} — ${toDelete?.title}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}

// ── Schedule Tab ──────────────────────────────────────────────────────────────

const SCHEDULE_TYPES = ['Baseline', 'Lookahead', 'Milestone'];

function ScheduleFormModal({ isOpen, onClose, onSave, initial, projectId }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({ name: '', type: 'Baseline', phase: '', startDate: '', endDate: '', percentComplete: 0, predecessor: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        type: initial.type || 'Baseline',
        phase: initial.phase || '',
        startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
        endDate: initial.endDate ? initial.endDate.slice(0, 10) : '',
        percentComplete: initial.percentComplete || 0,
        predecessor: initial.predecessor || '',
        notes: initial.notes || '',
      });
    } else {
      setForm({ name: '', type: 'Baseline', phase: '', startDate: '', endDate: '', percentComplete: 0, predecessor: '', notes: '' });
    }
  }, [initial, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = editing
        ? await updateScheduleItem(projectId, initial.id, form)
        : await createScheduleItem(projectId, form);
      onSave(result, editing);
      toast.success(editing ? 'Schedule item updated' : 'Schedule item added');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit Schedule Item' : 'New Schedule Item'}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Activity Name *">
              <input value={form.name} onChange={set('name')} required placeholder="e.g. Structural Steel Erection" className={inputCls} />
            </Field>
          </div>
          <Field label="Schedule Type">
            <select value={form.type} onChange={set('type')} className={selectCls}>
              {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Phase">
            <input value={form.phase} onChange={set('phase')} placeholder="e.g. Structure, Enclosure, Fit-out" className={inputCls} />
          </Field>
          <Field label="Start Date *">
            <input type="date" value={form.startDate} onChange={set('startDate')} required className={inputCls} />
          </Field>
          <Field label="End Date *">
            <input type="date" value={form.endDate} onChange={set('endDate')} required className={inputCls} />
          </Field>
          <Field label="% Complete">
            <input type="number" min="0" max="100" value={form.percentComplete} onChange={set('percentComplete')} className={inputCls} />
          </Field>
          <Field label="Predecessor">
            <input value={form.predecessor} onChange={set('predecessor')} placeholder="e.g. Foundation Work" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={2} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Activity'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ScheduleTab({ projectId, scheduleItems, onScheduleChange }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const handleSave = (item, isEdit) => {
    if (isEdit) onScheduleChange(scheduleItems.map((s) => s.id === item.id ? item : s));
    else onScheduleChange([...scheduleItems, item].sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
  };

  const handleDelete = async () => {
    try {
      await deleteScheduleItem(projectId, toDelete.id);
      onScheduleChange(scheduleItems.filter((s) => s.id !== toDelete.id));
      setToDelete(null);
      toast.success('Schedule item deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = filterType === 'All' ? scheduleItems : scheduleItems.filter((s) => s.type === filterType);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2">
          {['All', ...SCHEDULE_TYPES].map((t) => (
            <button key={t} type="button" onClick={() => setFilterType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filterType === t ? 'bg-teal-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Activity</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No schedule items" description="Add baseline schedule and three-week lookahead activities to track project progress." />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const duration = Math.round((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));
            return (
              <Card key={item.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-400">{item.type}</span>
                      {item.phase && <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-300">{item.phase}</span>}
                    </div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>{formatDate(item.startDate)} → {formatDate(item.endDate)}</span>
                      <span>{duration} day{duration !== 1 ? 's' : ''}</span>
                      {item.predecessor && <span>After: {item.predecessor}</span>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 max-w-xs h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(item.percentComplete, 100)}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{item.percentComplete}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => { setEditing(item); setShowModal(true); }}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                        <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474z" />
                        <path d="M3.5 3.75c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.75 14h-8.5A1.75 1.75 0 013.5 12.25v-8.5z" />
                      </svg>
                    </button>
                    <DeleteBtn onClick={() => setToDelete(item)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ScheduleFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editing} projectId={projectId} />
      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete schedule item" description={`Remove "${toDelete?.name}" from the schedule? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}

// ── Trades Tab ────────────────────────────────────────────────────────────────

const TRADE_STATUS_COLORS = { Active: 'bg-teal-500/20 text-teal-300', Completed: 'bg-emerald-500/20 text-emerald-300', 'On Hold': 'bg-amber-500/20 text-amber-300' };

function TradeFormModal({ isOpen, onClose, onSave, initial, projectId }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', trade: '', contractValue: '', status: 'Active', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        companyName: initial.companyName || '',
        contactName: initial.contactName || '',
        email: initial.email || '',
        phone: initial.phone || '',
        trade: initial.trade || '',
        contractValue: initial.contractValue || '',
        status: initial.status || 'Active',
        notes: initial.notes || '',
      });
    } else {
      setForm({ companyName: '', contactName: '', email: '', phone: '', trade: '', contractValue: '', status: 'Active', notes: '' });
    }
  }, [initial, isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = editing
        ? await updateTrade(projectId, initial.id, form)
        : await createTrade(projectId, form);
      onSave(result, editing);
      toast.success(editing ? 'Trade updated' : 'Trade added');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">{editing ? 'Edit Trade' : 'Add Trade'}</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company Name *">
            <input value={form.companyName} onChange={set('companyName')} required placeholder="e.g. Steel Works Ltd." className={inputCls} />
          </Field>
          <Field label="Trade *">
            <input value={form.trade} onChange={set('trade')} required placeholder="e.g. Structural Steel" className={inputCls} />
          </Field>
          <Field label="Contact Name">
            <input value={form.contactName} onChange={set('contactName')} placeholder="Name" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set('phone')} placeholder="902-555-0100" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email">
              <input type="email" value={form.email} onChange={set('email')} placeholder="contact@company.ca" className={inputCls} />
            </Field>
          </div>
          <Field label="Contract Value ($)">
            <input type="number" min="0" step="0.01" value={form.contractValue} onChange={set('contractValue')} placeholder="0.00" className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')} className={selectCls}>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Scope of work, contract notes, approved materials..." className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Trade'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function TradesTab({ projectId, trades, onTradesChange }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const handleSave = (trade, isEdit) => {
    if (isEdit) onTradesChange(trades.map((t) => t.id === trade.id ? trade : t));
    else onTradesChange([trade, ...trades]);
  };

  const handleDelete = async () => {
    try {
      await deleteTrade(projectId, toDelete.id);
      onTradesChange(trades.filter((t) => t.id !== toDelete.id));
      setToDelete(null);
      toast.success('Trade deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalContract = trades.reduce((sum, t) => sum + (parseFloat(t.contractValue) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {totalContract > 0 && (
          <p className="text-sm text-slate-400">Total trade value: <span className="font-semibold text-white">{formatCurrency(totalContract)}</span></p>
        )}
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Trade</Button>
      </div>

      {trades.length === 0 ? (
        <EmptyState title="No trades" description="Add trade contractors with contact info, contract values, and scope of work." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {trades.map((trade) => (
            <Card key={trade.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={trade.status} colorMap={TRADE_STATUS_COLORS} />
                  </div>
                  <p className="font-bold text-white">{trade.companyName}</p>
                  <p className="text-sm text-teal-300">{trade.trade}</p>
                  {trade.contactName && <p className="mt-1 text-sm text-slate-400">{trade.contactName}</p>}
                  {trade.phone && <p className="text-sm text-slate-400">{trade.phone}</p>}
                  {trade.email && <p className="text-sm text-slate-400">{trade.email}</p>}
                  {trade.contractValue && (
                    <p className="mt-2 text-sm font-semibold text-white">Contract: {formatCurrency(trade.contractValue)}</p>
                  )}
                  {trade.notes && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{trade.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => { setEditing(trade); setShowModal(true); }}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                      <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L6.75 6.774a2.75 2.75 0 00-.596.892l-.848 2.047a.75.75 0 00.98.98l2.047-.848a2.75 2.75 0 00.892-.596l4.261-4.263a1.75 1.75 0 000-2.474z" />
                      <path d="M3.5 3.75c0-.966.784-1.75 1.75-1.75h2.5a.75.75 0 010 1.5h-2.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.75 14h-8.5A1.75 1.75 0 013.5 12.25v-8.5z" />
                    </svg>
                  </button>
                  <DeleteBtn onClick={() => setToDelete(trade)} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TradeFormModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleSave} initial={editing} projectId={projectId} />
      <ConfirmModal isOpen={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete}
        title="Delete trade" description={`Remove "${toDelete?.companyName} (${toDelete?.trade})"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'site-logs', label: 'Site Logs' },
  { id: 'rfis', label: 'RFIs' },
  { id: 'deficiencies', label: 'Deficiencies' },
  { id: 'safety', label: 'Safety' },
  { id: 'submittals', label: 'Submittals' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'trades', label: 'Trades' },
];

export function ConstructionProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchProject(id)
      .then(setProject)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <LoadingState title="Loading project" description="Fetching project data..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <EmptyState title="Project not found" description="This project does not exist or you do not have access." />
      </div>
    );
  }

  const badgeCounts = {
    'rfis': project.rfis?.filter((r) => r.status === 'Open').length,
    'deficiencies': project.deficiencies?.filter((d) => d.status !== 'Resolved').length,
    'safety': project.safetyRecords?.length,
    'submittals': project.submittals?.filter((s) => s.status === 'Pending' || s.status === 'Submitted').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-6 flex items-start gap-3">
        <Link to="/construction" className="mt-1 text-slate-400 hover:text-white transition text-sm">
          ← Projects
        </Link>
      </div>

      <div className="mb-2 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Construction</p>
          <h1 className="text-3xl font-extrabold text-white truncate">{project.name}</h1>
          {project.clientName && <p className="mt-1 text-slate-400">{project.clientName}</p>}
          {project.address && <p className="text-sm text-slate-500">{project.address}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[project.status] || 'bg-white/10 text-slate-300'}`}>
          {project.status}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <nav className="flex w-max gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
          {TABS.map((t) => {
            const count = badgeCounts[t.id];
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${tab === t.id ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:bg-white/10'}`}>
                {t.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold leading-none ${tab === t.id ? 'bg-slate-950/30 text-slate-950' : 'bg-teal-500/20 text-teal-300'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'overview' && (
          <OverviewTab project={project} onProjectUpdated={(updated) => setProject((p) => ({ ...p, ...updated }))} />
        )}
        {tab === 'site-logs' && (
          <SiteLogsTab projectId={id} logs={project.siteLogs || []}
            onLogsChange={(logs) => setProject((p) => ({ ...p, siteLogs: logs }))} />
        )}
        {tab === 'rfis' && (
          <RFIsTab projectId={id} rfis={project.rfis || []}
            onRFIsChange={(rfis) => setProject((p) => ({ ...p, rfis }))} />
        )}
        {tab === 'deficiencies' && (
          <DeficienciesTab projectId={id} deficiencies={project.deficiencies || []}
            onDeficienciesChange={(deficiencies) => setProject((p) => ({ ...p, deficiencies }))} />
        )}
        {tab === 'safety' && (
          <SafetyTab projectId={id} safetyRecords={project.safetyRecords || []}
            onSafetyChange={(safetyRecords) => setProject((p) => ({ ...p, safetyRecords }))} />
        )}
        {tab === 'submittals' && (
          <SubmittalsTab projectId={id} submittals={project.submittals || []}
            onSubmittalsChange={(submittals) => setProject((p) => ({ ...p, submittals }))} />
        )}
        {tab === 'schedule' && (
          <ScheduleTab projectId={id} scheduleItems={project.scheduleItems || []}
            onScheduleChange={(scheduleItems) => setProject((p) => ({ ...p, scheduleItems }))} />
        )}
        {tab === 'trades' && (
          <TradesTab projectId={id} trades={project.trades || []}
            onTradesChange={(trades) => setProject((p) => ({ ...p, trades }))} />
        )}
      </div>
    </div>
  );
}
