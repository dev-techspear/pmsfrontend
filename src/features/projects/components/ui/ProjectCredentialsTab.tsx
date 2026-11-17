import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  KeyRound, Plus, Eye, EyeOff, Copy, Pencil, Trash2, Lock, Globe, X,
  Server, Database, Cloud, GitBranch, Link2, ChevronDown, Check,
} from 'lucide-react';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/providers/ToastContext';
import { credentialsService, ProjectCredential } from '@/api/services/credentials.service';
import { CREDENTIAL_TYPES, SECRET_AUTO_HIDE_MS } from '@/features/projects/constants/sharing';
import { ShareWithPicker, ShareValue, EVERYONE } from './ShareWithPicker';

const typeIcon = (t: string) =>
  ({ Server, Database, Cloud, Git: GitBranch, ApiKey: KeyRound, Application: Link2 } as Record<string, React.ElementType>)[t] ?? KeyRound;

const fmt = (d?: string | null) => {
  try { return d ? format(new Date(d), 'MMM d, yyyy') : '—'; } catch { return d ?? '—'; }
};

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;

/* ─── Add / Edit Credential Modal ─────────────────────────────────────── */
interface FormProps {
  projectId: number;
  existing: ProjectCredential | null;
  onClose: () => void;
  onSaved: () => void;
}

function CredentialForm({ projectId, existing, onClose, onSaved }: FormProps) {
  const { showToast } = useToast();
  const [label, setLabel] = useState(existing?.label ?? '');
  const [type, setType] = useState(existing?.credential_type ?? CREDENTIAL_TYPES[0].value);
  const [host, setHost] = useState(existing?.host ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [share, setShare] = useState<ShareValue>(
    existing
      ? { restrict_access: existing.restrict_access, role_ids: existing.shared_role_ids, user_ids: existing.shared_user_ids }
      : { ...EVERYONE, restrict_access: true }, // credentials default to restricted
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ label?: string; secret?: string }>({});

  const save = async () => {
    const next: typeof errors = {};
    if (!label.trim()) next.label = 'Label is required.';
    if (!existing && !secret) next.secret = 'Secret is required.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const body = {
        label: label.trim(),
        credential_type: type,
        host: host.trim(),
        username: username.trim(),
        notes: notes.trim(),
        restrict_access: share.restrict_access,
        role_ids: share.role_ids,
        user_ids: share.user_ids,
      };
      if (existing) {
        await credentialsService.update(projectId, existing.id, { ...body, ...(secret ? { secret } : {}) });
        showToast('success', 'Saved', secret ? 'Credential updated and secret rotated.' : 'Credential updated.');
      } else {
        await credentialsService.create(projectId, { ...body, secret });
        showToast('success', 'Saved', 'Credential stored (encrypted).');
      }
      onSaved();
      onClose();
    } catch (e) {
      showToast('error', 'Error', errMsg(e, 'Could not save the credential.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4.5"
          style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' }}
            >
              <KeyRound size={17} className="text-slate-900" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {existing ? 'Edit Credential' : 'Add Credential'}
              </h3>
              <p className="text-[11.5px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {existing ? 'Update stored details or rotate secret' : 'Securely stored and encrypted at rest'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4.5 overflow-y-auto">
          {/* Label */}
          <FormField label="Credential Label" required htmlFor="cred-label" error={errors.label}>
            <TextInput
              id="cred-label"
              placeholder="e.g. Production Database, Staging API Key"
              value={label}
              onChange={e => setLabel(e.target.value)}
              className="w-full h-11 px-4 text-[13.5px] font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </FormField>

          {/* Type */}
          <FormField label="Credential Type" required htmlFor="cred-type">
            <div className="relative">
              <select
                id="cred-type"
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-11 px-4 pr-10 text-[13.5px] font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer transition-all"
              >
                {CREDENTIAL_TYPES.map(t => (
                  <option key={t.value} value={t.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-1">
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </FormField>

          {/* Host / URL and Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Host / URL" htmlFor="cred-host">
              <TextInput
                id="cred-host"
                placeholder="e.g. db.techspear.in"
                value={host}
                onChange={e => setHost(e.target.value)}
                className="w-full h-11 px-4 text-[13px] font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </FormField>
            <FormField label="Username / Client ID" htmlFor="cred-user">
              <TextInput
                id="cred-user"
                autoComplete="off"
                placeholder="e.g. admin or sa_leads"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full h-11 px-4 text-[13px] font-medium rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </FormField>
          </div>

          {/* Secret */}
          <FormField
            label={existing ? 'New Secret (Password / Key / Token)' : 'Secret (Password / Key / Token)'}
            required={!existing}
            htmlFor="cred-secret"
            error={errors.secret}
            hint={existing ? 'Leave blank to preserve the stored secret.' : 'Encrypted with AES-256 at rest; never shown in lists.'}
          >
            <div className="relative">
              <TextInput
                id="cred-secret"
                type={showSecret ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder={existing ? '•••••••••••••••• (leave empty to keep current)' : 'Enter password, private key or token'}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="w-full h-11 px-4 pr-11 font-mono text-[13px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSecret(v => !v)}
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          {/* Notes */}
          <FormField label="Notes & Parameters" htmlFor="cred-notes">
            <TextAreaInput
              id="cred-notes"
              rows={3}
              placeholder="Optional connection notes, port details, or rotation notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl p-3.5 min-h-[76px] max-h-32 text-[13px] font-medium resize-y border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
          </FormField>

          {/* Access Control */}
          <div className="pt-2 border-t border-[var(--border-color)]">
            <ShareWithPicker projectId={projectId} value={share} onChange={setShare} noun="credential" />
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-4 h-10 text-[13px]">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={save}
            disabled={saving}
            className="!px-6 !h-10 !rounded-xl text-[13.5px] font-bold shadow-sm"
          >
            {saving ? 'Saving…' : existing ? 'Update Credential' : 'Save Credential'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Credential Card Component ───────────────────────────────────────── */
interface RowProps {
  projectId: number;
  cred: ProjectCredential;
  onEdit: () => void;
  onDelete: () => void;
}

function CredentialCard({ projectId, cred, onEdit, onDelete }: RowProps) {
  const { showToast } = useToast();
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);
  const Icon = typeIcon(cred.credential_type);

  // The revealed secret is held in memory only, and hidden again after a short time.
  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(copyTimer.current);
  }, []);

  const reveal = async (): Promise<string | null> => {
    setBusy(true);
    try {
      const s = await credentialsService.reveal(projectId, cred.id);
      setSecret(s);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSecret(null), SECRET_AUTO_HIDE_MS);
      return s;
    } catch (e) {
      showToast('error', 'Error', errMsg(e, 'Could not reveal the secret.'));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    const s = secret ?? (await reveal());
    if (!s) return;
    try {
      await navigator.clipboard.writeText(s);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
      showToast('success', 'Copied', 'Secret copied to clipboard.');
    } catch {
      showToast('warning', 'Copy failed', 'Select the secret and copy it manually.');
    }
  };

  const sharedCount = cred.shared_role_ids.length + cred.shared_user_ids.length;

  return (
    <div
      className="rounded-2xl p-4.5 space-y-3.5 transition-all duration-200 hover:shadow-md"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <Icon size={18} style={{ color: '#0CD1C3' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold truncate leading-snug" style={{ color: 'var(--text-primary)' }} title={cred.label}>
            {cred.label}
          </p>
          <p className="text-[11.5px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {CREDENTIAL_TYPES.find(t => t.value === cred.credential_type)?.label ?? cred.credential_type}
            {cred.host ? ` · ${cred.host}` : ''}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[10.5px] font-bold rounded-full px-2.5 py-1 shrink-0"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
          title={cred.restrict_access ? 'Only specific roles/users have access' : 'Everyone on this project has access'}
        >
          {cred.restrict_access ? <Lock size={11} className="text-amber-500" /> : <Globe size={11} className="text-teal-500" />}
          {cred.restrict_access ? (sharedCount ? `Shared · ${sharedCount}` : 'Only you') : 'Everyone'}
        </span>
      </div>

      {/* Username if present */}
      {cred.username && (
        <div className="text-[12px] px-1" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Username: </span>
          <span className="font-mono font-medium">{cred.username}</span>
        </div>
      )}

      {/* Secret Reveal / Copy Box */}
      <div
        className="flex items-center gap-2 rounded-xl px-3.5 h-10.5"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
      >
        <span
          className="flex-1 min-w-0 truncate font-mono text-[12px] tracking-wider select-all"
          style={{ color: secret ? 'var(--text-primary)' : 'var(--text-muted)' }}
          data-testid="secret-value"
        >
          {secret ?? '••••••••••••••••'}
        </span>

        {/* Reveal Toggle Button */}
        <button
          type="button"
          onClick={() => (secret ? setSecret(null) : reveal())}
          disabled={busy}
          aria-label={secret ? 'Hide secret' : 'Reveal secret'}
          title={secret ? 'Hide secret' : 'Reveal secret (logged)'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors focus:outline-none disabled:opacity-50"
        >
          {secret ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>

        {/* Copy Button */}
        <button
          type="button"
          onClick={copy}
          disabled={busy}
          aria-label="Copy secret"
          title="Copy to clipboard"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors focus:outline-none disabled:opacity-50"
        >
          {copied ? <Check size={14} className="text-teal-500" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Notes if present */}
      {cred.notes && (
        <p className="text-[12px] whitespace-pre-wrap px-1 leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
          {cred.notes}
        </p>
      )}

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/60">
        <p className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
          Updated {fmt(cred.last_rotated_at ?? cred.created_at)}
        </p>
        {cred.can_manage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit credential"
              title="Edit"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <Pencil size={13.5} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete credential"
              title="Delete"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none"
            >
              <Trash2 size={13.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Project Credentials Tab ────────────────────────────────────── */
interface TabProps {
  projectId: number;
  canCreate: boolean;
}

export function ProjectCredentialsTab({ projectId, canCreate }: TabProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ProjectCredential | 'new' | null>(null);

  const { data: creds = [], isLoading, refetch } = useQuery<ProjectCredential[]>({
    queryKey: ['credentials', projectId],
    queryFn: () => credentialsService.list(projectId),
    enabled: !!projectId,
  });

  const remove = async (c: ProjectCredential) => {
    if (!window.confirm(`Delete "${c.label}"? The stored secret will be permanently removed for everyone.`)) return;
    try {
      await credentialsService.remove(projectId, c.id);
      showToast('success', 'Deleted', 'Credential removed.');
      queryClient.invalidateQueries({ queryKey: ['credentials', projectId] });
    } catch (e) {
      showToast('error', 'Error', errMsg(e, 'Could not delete the credential.'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className="rounded-2xl px-5 py-4.5 flex flex-wrap items-center gap-4 shadow-sm"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3.5 flex-1 min-w-[220px]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' }}
          >
            <KeyRound size={18} className="text-slate-900" />
          </div>
          <div>
            <p className="text-[14.5px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Project Credentials
            </p>
            <p className="text-[11.5px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {creds.length} stored · encrypted at rest · every reveal is logged
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setEditing('new')}
            className="rounded-xl font-bold shadow-sm"
          >
            Add credential
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="py-12 text-center">
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading credentials…</p>
        </div>
      )}

      {!isLoading && creds.length === 0 && (
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <KeyRound size={26} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-[14.5px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            No credentials stored yet
          </p>
          <p className="text-[12px] max-w-sm" style={{ color: 'var(--text-muted)' }}>
            {canCreate
              ? 'Securely store server logins, database connection strings, and API keys for this project.'
              : 'Credentials shared with your role or account will appear here.'}
          </p>
          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setEditing('new')}
              className="mt-4 rounded-xl font-bold"
            >
              Add first credential
            </Button>
          )}
        </div>
      )}

      {creds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {creds.map(c => (
            <CredentialCard
              key={c.id}
              projectId={projectId}
              cred={c}
              onEdit={() => setEditing(c)}
              onDelete={() => remove(c)}
            />
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {editing && (
        <CredentialForm
          projectId={projectId}
          existing={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
