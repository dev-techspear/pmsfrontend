import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  KeyRound, Plus, Eye, EyeOff, Copy, Pencil, Trash2, Lock, Globe, X, Server, Database, Cloud, GitBranch, Link2,
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

const fmt = (d?: string | null) => { try { return d ? format(new Date(d), 'MMM d, yyyy') : '—'; } catch { return d ?? '—'; } };

const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;

const inputCls = `w-full rounded-xl px-4 h-11 text-[13px] font-medium outline-none transition-all
  bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]
  focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`;

/* ─── Add / edit dialog ───────────────────────────────────── */
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
      : { ...EVERYONE, restrict_access: true },   // credentials default to restricted
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
        label: label.trim(), credential_type: type, host, username, notes,
        restrict_access: share.restrict_access, role_ids: share.role_ids, user_ids: share.user_ids,
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
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{existing ? 'Edit credential' : 'Add credential'}</p>
          <Button onClick={onClose} aria-label="Close"><X size={15} style={{ color: 'var(--text-muted)' }} /></Button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>* required</p>
          <FormField label="Label" required htmlFor="cred-label" error={errors.label}>
            <TextInput id="cred-label" className={inputCls} placeholder="e.g. Production database" value={label} onChange={e => setLabel(e.target.value)} />
          </FormField>
          <FormField label="Type" required htmlFor="cred-type">
            <select id="cred-type" className={inputCls} value={type} onChange={e => setType(e.target.value)}>
              {CREDENTIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Host / URL" htmlFor="cred-host">
              <TextInput id="cred-host" className={inputCls} placeholder="db.example.com" value={host} onChange={e => setHost(e.target.value)} />
            </FormField>
            <FormField label="Username" htmlFor="cred-user">
              <TextInput id="cred-user" className={inputCls} autoComplete="off" value={username} onChange={e => setUsername(e.target.value)} />
            </FormField>
          </div>
          <FormField
            label={existing ? 'New secret' : 'Secret'}
            required={!existing}
            htmlFor="cred-secret"
            error={errors.secret}
            hint={existing ? 'Leave empty to keep the stored secret.' : 'Password, key or token. Stored encrypted; never shown in lists.'}
          >
            <div className="relative">
              <TextInput
                id="cred-secret"
                className={`${inputCls} pr-11`}
                type={showSecret ? 'text' : 'password'}
                autoComplete="new-password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => setShowSecret(v => !v)}
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
          </FormField>
          <FormField label="Notes" htmlFor="cred-notes">
            <TextAreaInput id="cred-notes" className={`${inputCls} h-20 py-2.5 resize-none`} value={notes} onChange={e => setNotes(e.target.value)} />
          </FormField>
          <ShareWithPicker projectId={projectId} value={share} onChange={setShare} noun="credential" />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving} className="!px-5 !h-10 !rounded-xl">{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── One credential row ──────────────────────────────────── */
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
  const timer = useRef<number | undefined>(undefined);
  const Icon = typeIcon(cred.credential_type);

  // The revealed secret is held in memory only, and hidden again after a short time.
  useEffect(() => () => window.clearTimeout(timer.current), []);

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
    } finally { setBusy(false); }
  };

  const copy = async () => {
    const s = secret ?? await reveal();
    if (!s) return;
    try {
      await navigator.clipboard.writeText(s);
      showToast('success', 'Copied', 'Secret copied to the clipboard.');
    } catch {
      showToast('warning', 'Copy failed', 'Select the secret and copy it manually.');
    }
  };

  const sharedCount = cred.shared_role_ids.length + cred.shared_user_ids.length;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
          <Icon size={18} style={{ color: '#0CD1C3' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold truncate" style={{ color: 'var(--text-primary)' }} title={cred.label}>{cred.label}</p>
          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {CREDENTIAL_TYPES.find(t => t.value === cred.credential_type)?.label ?? cred.credential_type}
            {cred.host ? ` · ${cred.host}` : ''}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-1 flex-shrink-0"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
          title={cred.restrict_access ? 'Only the shared roles / people can see this' : 'Everyone on the project can see this'}
        >
          {cred.restrict_access ? <Lock size={11} /> : <Globe size={11} />}
          {cred.restrict_access ? (sharedCount ? `Shared · ${sharedCount}` : 'Only you') : 'Everyone'}
        </span>
      </div>

      {cred.username && (
        <div className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Username </span>{cred.username}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl px-3 h-10" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <span className="flex-1 min-w-0 truncate font-mono text-[12px]" style={{ color: 'var(--text-primary)' }} data-testid="secret-value">
          {secret ?? '••••••••••••'}
        </span>
        <Button
          type="button"
          onClick={() => (secret ? setSecret(null) : reveal())}
          disabled={busy}
          aria-label={secret ? 'Hide secret' : 'Reveal secret'}
          title={secret ? 'Hide' : 'Reveal (logged)'}
        >
          {secret ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
        <Button type="button" onClick={copy} disabled={busy} aria-label="Copy secret" title="Copy"><Copy size={14} /></Button>
      </div>

      {cred.notes && <p className="text-[12px] whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>{cred.notes}</p>}

      <div className="flex items-center justify-between pt-1">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Rotated {fmt(cred.last_rotated_at ?? cred.created_at)}</p>
        {cred.can_manage && (
          <div className="flex gap-1">
            <Button type="button" onClick={onEdit} aria-label="Edit credential" title="Edit"><Pencil size={14} /></Button>
            <Button type="button" onClick={onDelete} aria-label="Delete credential" title="Delete" className="text-red-500"><Trash2 size={14} /></Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Tab ─────────────────────────────────────────────────── */
interface TabProps { projectId: number; canCreate: boolean; }

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
    if (!window.confirm(`Delete "${c.label}"? The stored secret will be gone for everyone.`)) return;
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
      <div className="rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B3F57B,#0CD1C3)' }}>
            <KeyRound size={16} className="text-slate-900" />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Project Credentials</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {creds.length} stored · encrypted at rest · every reveal is logged
            </p>
          </div>
        </div>
        {canCreate && (
          <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setEditing('new')}>Add credential</Button>
        )}
      </div>

      {isLoading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading…</p>}

      {!isLoading && creds.length === 0 && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <KeyRound size={32} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          <p className="text-[14px] font-bold mt-3 mb-1" style={{ color: 'var(--text-primary)' }}>No credentials you can see</p>
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {canCreate ? 'Store server logins, database strings and API keys for this project.' : 'Credentials shared with you will appear here.'}
          </p>
        </div>
      )}

      {creds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {creds.map(c => (
            <CredentialCard key={c.id} projectId={projectId} cred={c} onEdit={() => setEditing(c)} onDelete={() => remove(c)} />
          ))}
        </div>
      )}

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
