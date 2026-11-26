import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Link2, Plus, Pencil, Trash2, X, ExternalLink, Lock, Globe, StickyNote, Pin, PinOff,
  GitBranch, MonitorSmartphone, FlaskConical, Palette, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { FormField } from '@/components/forms/FormField';
import { useToast } from '@/providers/ToastContext';
import {
  projectLinksService, projectNotesService, ProjectLink, ProjectNote,
} from '@/api/services/projectLinksNotes.service';
import { LINK_TYPES, NOTE_MAX_LENGTH } from '@/features/projects/constants/sharing';
import { ShareWithPicker, ShareValue, EVERYONE } from './ShareWithPicker';

const typeIcon: Record<string, React.ElementType> = {
  Repo: GitBranch, Live: MonitorSmartphone, Staging: FlaskConical, Design: Palette, Docs: BookOpen,
};
const fmt = (d?: string | null) => { try { return d ? format(new Date(d), 'MMM d, yyyy') : ''; } catch { return d ?? ''; } };
const errMsg = (e: any, fallback: string) => e?.response?.data?.message || e?.message || fallback;
const shareOf = (x: { restrict_access: boolean; shared_role_ids: number[]; shared_user_ids: number[] }): ShareValue =>
  ({ restrict_access: x.restrict_access, role_ids: x.shared_role_ids, user_ids: x.shared_user_ids });

const inputCls = `w-full rounded-xl px-4 h-11 text-[13px] font-medium outline-none transition-all
  bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]
  focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`;

function Dialog({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
          <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" onClick={onClose} aria-label="Close"><X size={15} style={{ color: 'var(--text-muted)' }} /></Button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>{footer}</div>
      </div>
    </div>
  );
}

/* ─── Link form ───────────────────────────────────────────── */
function LinkForm({ projectId, existing, onClose, onSaved }: { projectId: number; existing: ProjectLink | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [url, setUrl] = useState(existing?.url ?? '');
  const [type, setType] = useState(existing?.link_type ?? LINK_TYPES[0].value);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [share, setShare] = useState<ShareValue>(existing ? shareOf(existing) : EVERYONE);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  const save = async () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Title is required.';
    if (!/^https?:\/\/\S+$/i.test(url.trim())) next.url = 'Enter a full address starting with http:// or https://';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const body = { title: title.trim(), url: url.trim(), link_type: type, description, ...share };
      if (existing) await projectLinksService.update(projectId, existing.id, body);
      else await projectLinksService.create(projectId, body);
      showToast('success', 'Saved', 'Link saved.');
      onSaved();
      onClose();
    } catch (e) {
      showToast('error', 'Error', errMsg(e, 'Could not save the link.'));
    } finally { setSaving(false); }
  };

  return (
    <Dialog
      title={existing ? 'Edit link' : 'Add link'}
      onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={saving} className="!px-5 !h-10 !rounded-xl">{saving ? 'Saving…' : 'Save'}</Button>
      </>}
    >
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>* required</p>
      <FormField label="Title" required htmlFor="link-title" error={errors.title}>
        <TextInput id="link-title" className={inputCls} placeholder="e.g. Backend repository" value={title} onChange={e => setTitle(e.target.value)} />
      </FormField>
      <FormField label="URL" required htmlFor="link-url" error={errors.url}>
        <TextInput id="link-url" className={inputCls} placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} />
      </FormField>
      <FormField label="Type" required htmlFor="link-type">
        <select id="link-type" className={inputCls} value={type} onChange={e => setType(e.target.value)}>
          {LINK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </FormField>
      <FormField label="Description" htmlFor="link-desc">
        <TextAreaInput id="link-desc" className={`${inputCls} h-20 py-2.5 resize-none`} value={description} onChange={e => setDescription(e.target.value)} />
      </FormField>
      <ShareWithPicker projectId={projectId} value={share} onChange={setShare} noun="link" />
    </Dialog>
  );
}

/* ─── Note form ───────────────────────────────────────────── */
function NoteForm({ projectId, existing, onClose, onSaved }: { projectId: number; existing: ProjectNote | null; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [pinned, setPinned] = useState(existing?.is_pinned ?? false);
  const [share, setShare] = useState<ShareValue>(existing ? shareOf(existing) : EVERYONE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const save = async () => {
    if (!body.trim()) { setError('A note cannot be empty.'); return; }
    setError(undefined);
    setSaving(true);
    try {
      const payload = { title: title.trim(), body, is_pinned: pinned, ...share };
      if (existing) await projectNotesService.update(projectId, existing.id, payload);
      else await projectNotesService.create(projectId, payload);
      showToast('success', 'Saved', 'Note saved.');
      onSaved();
      onClose();
    } catch (e) {
      showToast('error', 'Error', errMsg(e, 'Could not save the note.'));
    } finally { setSaving(false); }
  };

  return (
    <Dialog
      title={existing ? 'Edit note' : 'Add note'}
      onClose={onClose}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={saving} className="!px-5 !h-10 !rounded-xl">{saving ? 'Saving…' : 'Save'}</Button>
      </>}
    >
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>* required</p>
      <FormField label="Title" htmlFor="note-title">
        <TextInput id="note-title" className={inputCls} maxLength={200} value={title} onChange={e => setTitle(e.target.value)} />
      </FormField>
      <FormField label="Note" required htmlFor="note-body" error={error} hint={`${body.length} / ${NOTE_MAX_LENGTH}`}>
        <TextAreaInput id="note-body" className={`${inputCls} h-40 py-2.5 resize-y`} maxLength={NOTE_MAX_LENGTH} value={body} onChange={e => setBody(e.target.value)} />
      </FormField>
      <label className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: 'var(--text-primary)' }}>
        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} /> Pin to the top
      </label>
      <ShareWithPicker projectId={projectId} value={share} onChange={setShare} noun="note" />
    </Dialog>
  );
}

const Badge = ({ restricted }: { restricted: boolean }) => (
  <span
    className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-1 flex-shrink-0"
    style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
    title={restricted ? 'Only the shared roles / people can see this' : 'Everyone on the project can see this'}
  >
    {restricted ? <Lock size={11} /> : <Globe size={11} />}{restricted ? 'Restricted' : 'Everyone'}
  </span>
);

/* ─── Tab ─────────────────────────────────────────────────── */
export function ProjectLinksNotesTab({ projectId, canAddLinks }: { projectId: number; canAddLinks: boolean }) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editLink, setEditLink] = useState<ProjectLink | 'new' | null>(null);
  const [editNote, setEditNote] = useState<ProjectNote | 'new' | null>(null);

  const { data: links = [], isLoading: linksLoading, refetch: refetchLinks } = useQuery<ProjectLink[]>({
    queryKey: ['project-links', projectId], queryFn: () => projectLinksService.list(projectId), enabled: !!projectId,
  });
  const { data: notes = [], isLoading: notesLoading, refetch: refetchNotes } = useQuery<ProjectNote[]>({
    queryKey: ['project-notes', projectId], queryFn: () => projectNotesService.list(projectId), enabled: !!projectId,
  });

  const afterLinkChange = () => { refetchLinks(); queryClient.invalidateQueries({ queryKey: ['project-links', projectId] }); };

  const removeLink = async (l: ProjectLink) => {
    if (!window.confirm(`Delete the link "${l.title}"?`)) return;
    try { await projectLinksService.remove(projectId, l.id); afterLinkChange(); }
    catch (e) { showToast('error', 'Error', errMsg(e, 'Could not delete the link.')); }
  };
  const removeNote = async (n: ProjectNote) => {
    if (!window.confirm('Delete this note?')) return;
    try { await projectNotesService.remove(projectId, n.id); refetchNotes(); }
    catch (e) { showToast('error', 'Error', errMsg(e, 'Could not delete the note.')); }
  };
  const togglePin = async (n: ProjectNote) => {
    try { await projectNotesService.update(projectId, n.id, { is_pinned: !n.is_pinned }); refetchNotes(); }
    catch (e) { showToast('error', 'Error', errMsg(e, 'Could not change the pin.')); }
  };

  const section = 'rounded-2xl p-5 space-y-4';
  const sectionStyle = { background: 'var(--bg-card)', border: '1px solid var(--border-color)' };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Links */}
      <div className={section} style={sectionStyle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 size={16} style={{ color: '#0CD1C3' }} />
            <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Links ({links.length})</p>
          </div>
          {canAddLinks && <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setEditLink('new')}>Add link</Button>}
        </div>
        {linksLoading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {!linksLoading && links.length === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {canAddLinks ? 'Add the repository, live site, staging and design links for this project.' : 'No links have been shared with you yet.'}
          </p>
        )}
        <ul className="space-y-2">
          {links.map(l => {
            const Icon = typeIcon[l.link_type] ?? Link2;
            return (
              <li key={l.id} className="flex items-start gap-3 rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
                <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <div className="min-w-0 flex-1">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] font-bold truncate hover:underline" style={{ color: 'var(--text-primary)' }}>
                    <span className="truncate">{l.title}</span><ExternalLink size={11} className="flex-shrink-0" />
                  </a>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{l.url}</p>
                  {l.description && <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{l.description}</p>}
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {LINK_TYPES.find(t => t.value === l.link_type)?.label ?? l.link_type}{l.created_by_name ? ` · ${l.created_by_name}` : ''} · {fmt(l.created_at)}
                  </p>
                </div>
                <Badge restricted={l.restrict_access} />
                {l.can_manage && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" type="button" onClick={() => setEditLink(l)} aria-label="Edit link" title="Edit"><Pencil size={14} /></Button>
                    <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" type="button" onClick={() => removeLink(l)} aria-label="Delete link" title="Delete"><Trash2 size={14} /></Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Notes */}
      <div className={section} style={sectionStyle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote size={16} style={{ color: '#0CD1C3' }} />
            <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Notes ({notes.length})</p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setEditNote('new')}>Add note</Button>
        </div>
        {notesLoading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {!notesLoading && notes.length === 0 && (
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Jot down decisions, access instructions or anything the team should know.</p>
        )}
        <ul className="space-y-3">
          {notes.map(n => (
            <li key={n.id} className="rounded-xl p-3" style={{ border: `1px solid ${n.is_pinned ? '#0CD1C3' : 'var(--border-color)'}` }}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  {n.title && <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>}
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {n.author_name ?? 'Unknown'} · {fmt(n.created_at)}{n.updated_at ? ' · edited' : ''}
                  </p>
                </div>
                <Badge restricted={n.restrict_access} />
                {n.can_manage && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" type="button" onClick={() => togglePin(n)} aria-label={n.is_pinned ? 'Unpin note' : 'Pin note'} title={n.is_pinned ? 'Unpin' : 'Pin'}>
                      {n.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </Button>
                    <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" type="button" onClick={() => setEditNote(n)} aria-label="Edit note" title="Edit"><Pencil size={14} /></Button>
                    <Button unstyled className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-transparent border-0 cursor-pointer text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50" type="button" onClick={() => removeNote(n)} aria-label="Delete note" title="Delete"><Trash2 size={14} /></Button>
                  </div>
                )}
              </div>
              {/* Plain text only: React escapes it, URLs are not auto-linked, nothing is rendered as HTML. */}
              <p className="text-[13px] mt-2 whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>{n.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {editLink && (
        <LinkForm projectId={projectId} existing={editLink === 'new' ? null : editLink} onClose={() => setEditLink(null)} onSaved={afterLinkChange} />
      )}
      {editNote && (
        <NoteForm projectId={projectId} existing={editNote === 'new' ? null : editNote} onClose={() => setEditNote(null)} onSaved={refetchNotes} />
      )}
    </div>
  );
}
