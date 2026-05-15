import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProject, deleteProject, fetchProjects } from '../api/construction.js';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { Modal } from '../components/Modal.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const STATUS_COLORS = {
  Active: 'bg-teal-500/20 text-teal-300',
  Completed: 'bg-emerald-500/20 text-emerald-300',
  'On Hold': 'bg-amber-500/20 text-amber-300',
  Preconstruction: 'bg-violet-500/20 text-violet-300',
};

const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'Institutional', 'Infrastructure', 'Renovation', 'Other'];
const STATUSES = ['Preconstruction', 'Active', 'On Hold', 'Completed'];

function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '', clientName: '', address: '', type: '', status: 'Active',
    budget: '', contractValue: '', startDate: '', endDate: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    try {
      setSaving(true);
      const project = await createProject(form);
      onCreate(project);
      toast.success('Project created');
      onClose();
      setForm({ name: '', clientName: '', address: '', type: '', status: 'Active', budget: '', contractValue: '', startDate: '', endDate: '', notes: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-bold text-white">New Construction Project</h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Project Name *</label>
            <input value={form.name} onChange={set('name')} required placeholder="e.g. Halifax Office Tower Phase 1"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Client Name</label>
            <input value={form.clientName} onChange={set('clientName')} placeholder="e.g. Portucana Construction"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Project Type</label>
            <select value={form.type} onChange={set('type')}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20">
              <option value="">Select type...</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Site Address</label>
            <input value={form.address} onChange={set('address')} placeholder="e.g. 123 Main St, Halifax, NS"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Status</label>
            <select value={form.status} onChange={set('status')}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Contract Value ($)</label>
            <input type="number" min="0" step="0.01" value={form.contractValue} onChange={set('contractValue')} placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Budget ($)</label>
            <input type="number" min="0" step="0.01" value={form.budget} onChange={set('budget')} placeholder="0.00"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Start Date</label>
            <input type="date" value={form.startDate} onChange={set('startDate')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">End Date</label>
            <input type="date" value={form.endDate} onChange={set('endDate')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Additional project details..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/40 focus:outline-none focus:ring-1 focus:ring-teal-400/20 resize-none" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function ConstructionPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProject(toDelete.id);
      setProjects((p) => p.filter((x) => x.id !== toDelete.id));
      setToDelete(null);
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          eyebrow="Construction"
          title="Projects"
          description="Manage site logs, RFIs, deficiencies, safety records, submittals, schedule, and trades — all in one place."
        />
        <div className="mb-2 shrink-0">
          <Button onClick={() => setShowNewModal(true)}>+ New Project</Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-8">
          <LoadingState title="Loading projects" description="Fetching your construction projects." />
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No projects yet"
            description="Create your first construction project to start tracking site activity, RFIs, safety records, and more."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[project.status] || 'bg-white/10 text-slate-300'}`}>
                    {project.status}
                  </span>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-white truncate">{project.name}</h2>
                  {project.clientName && <p className="mt-0.5 text-sm text-slate-400 truncate">{project.clientName}</p>}
                  {project.address && <p className="mt-0.5 text-xs text-slate-500 truncate">{project.address}</p>}
                </div>
                {project.type && (
                  <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400">{project.type}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                {project.contractValue && (
                  <span className="rounded-lg bg-white/5 px-2.5 py-1">Contract: {formatCurrency(project.contractValue)}</span>
                )}
                {project.startDate && (
                  <span className="rounded-lg bg-white/5 px-2.5 py-1">Start: {formatDate(project.startDate)}</span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {project._count?.rfis > 0 && (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-300">{project._count.rfis} RFI{project._count.rfis !== 1 ? 's' : ''}</span>
                )}
                {project._count?.deficiencies > 0 && (
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-300">{project._count.deficiencies} Deficienc{project._count.deficiencies !== 1 ? 'ies' : 'y'}</span>
                )}
                {project._count?.siteLogs > 0 && (
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-400">{project._count.siteLogs} Site Log{project._count.siteLogs !== 1 ? 's' : ''}</span>
                )}
                {project._count?.submittals > 0 && (
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-300">{project._count.submittals} Submittal{project._count.submittals !== 1 ? 's' : ''}</span>
                )}
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <Button as={Link} to={`/app/construction/projects/${project.id}`} className="flex-1">Open Project</Button>
                <Button variant="danger" onClick={() => setToDelete(project)} className="px-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={(p) => setProjects((prev) => [p, ...prev])}
      />

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Delete "${toDelete?.name}" and all its data (logs, RFIs, deficiencies, safety records, submittals, schedule, trades)? This cannot be undone.`}
        confirmLabel="Delete project"
      />
    </div>
  );
}
