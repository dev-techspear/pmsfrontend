import { TextAreaInput } from "@/components/forms/TextAreaInput";
import { TextInput } from "@/components/forms/TextInput";
import React, { useRef, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService, Document } from '@/api/services/documents.service';
import { useToast } from '@/providers/ToastContext';
import { Button } from '@/components/forms/Button';
import {
  Upload, File, FileText, FileImage, FileVideo, FileCode,
  FileArchive, ExternalLink, Trash2, Search, Link2, X,
  FolderOpen, CloudUpload, Download, Eye, MoreVertical,
  FileSpreadsheet, Presentation, Lock, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { ShareWithPicker, ShareValue, EVERYONE } from './ShareWithPicker';
import { DOCUMENT_ACCEPT, DOCUMENT_MAX_MB } from '@/features/projects/constants/sharing';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');
const resolveUrl = (url: string) => (url?.startsWith('http') ? url : `${API_BASE}${url}`);

function formatBytes(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
}

function getFileIcon(fileType?: string | null) {
  const t = (fileType ?? '').toLowerCase();
  if (t.includes('image')) return { icon: FileImage, color: '#ec4899', bg: '#fdf2f8' };
  if (t.includes('video')) return { icon: FileVideo, color: '#8b5cf6', bg: '#f5f3ff' };
  if (t.includes('pdf')) return { icon: FileText, color: '#ef4444', bg: '#fef2f2' };
  if (t.includes('sheet') || t.includes('excel') || t.includes('csv'))
    return { icon: FileSpreadsheet, color: '#16a34a', bg: '#f0fdf4' };
  if (t.includes('presentation') || t.includes('powerpoint'))
    return { icon: Presentation, color: '#f97316', bg: '#fff7ed' };
  if (t.includes('zip') || t.includes('rar') || t.includes('tar') || t.includes('gz'))
    return { icon: FileArchive, color: '#78716c', bg: '#fafaf9' };
  if (t.includes('text') || t.includes('doc') || t.includes('word'))
    return { icon: FileText, color: '#3b82f6', bg: '#eff6ff' };
  if (t.includes('json') || t.includes('javascript') || t.includes('html') || t.includes('css') || t.includes('code'))
    return { icon: FileCode, color: '#0891b2', bg: '#ecfeff' };
  if (t === 'url' || t.startsWith('http'))
    return { icon: Link2, color: '#0CD1C3', bg: '#f0fdfa' };
  return { icon: File, color: '#64748b', bg: '#f8fafc' };
}

/* ─── Upload area ─────────────────────────────────────────── */
interface DropZoneProps { onFiles: (files: FileList) => void; uploading: boolean; }

function DropZone({ onFiles, uploading }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  }, [onFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="relative cursor-pointer rounded-2xl transition-all duration-300"
      style={{
        border: `2px dashed ${dragOver ? '#0CD1C3' : 'var(--border-color)'}`,
        background: dragOver
          ? 'linear-gradient(135deg, rgba(12,209,195,0.06) 0%, rgba(99,102,241,0.04) 100%)'
          : 'var(--bg-secondary)',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={DOCUMENT_ACCEPT}
        className="hidden"
        onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ''; }}
      />
      <div
        className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)' }}
      >
        {uploading
          ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <CloudUpload size={24} className="text-slate-900" />
        }
      </div>
      <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
        {uploading ? 'Uploading…' : 'Drag & drop files or click to browse'}
      </p>
      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
        Max {DOCUMENT_MAX_MB} MB per file · you choose who can see it
      </p>
    </div>
  );
}

interface LinkModalProps { projectId: number; onClose: () => void; onSaved: () => void; }

function LinkModal({ projectId, onClose, onSaved }: LinkModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) {
      showToast('warn', 'Required', 'Title and URL are required.');
      return;
    }
    setSaving(true);
    try {
      await documentsService.createLinkDocument({ title, description: desc, file_url: url, file_type: 'url', project_id: projectId });
      showToast('success', 'Link Saved', 'Document link added to project.');
      onSaved();
      onClose();
    } catch {
      showToast('error', 'Error', 'Failed to save link.');
    } finally { setSaving(false); }
  };

  const inputCls = `w-full rounded-xl px-4 h-11 text-[13px] font-medium outline-none transition-all
    bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)]
    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B3F57B,#0CD1C3)' }}>
              <Link2 size={15} className="text-slate-900" />
            </div>
            <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Add Document Link</p>
          </div>
          <Button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={15} style={{ color: 'var(--text-muted)' }} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Title *</label>
            <TextInput className={inputCls} placeholder="e.g. Requirements Doc, Figma Design…" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>URL *</label>
            <TextInput className={inputCls} placeholder="https://…" type="url" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
            <TextAreaInput
              className={`${inputCls} h-20 py-2.5 resize-none`}
              placeholder="Optional description…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            className="!px-5 !h-10 !rounded-xl"
          >
            {saving ? 'Saving…' : 'Save Link'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DocCardProps {
  doc: Document;
  onDelete: (id: number) => void;
  onManage: (doc: Document) => void;
  deleting: boolean;
}

function DocCard({ doc, onDelete, onManage, deleting }: DocCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { showToast } = useToast();
  const { icon: Icon, color, bg } = getFileIcon(doc.file_type);
  const isLink = !doc.has_file && (doc.file_type === 'url' || !!doc.file_url?.startsWith('http'));
  const canManage = doc.can_manage !== false;

  // Files are never reachable by a permanent URL. The server checks sharing first and returns a
  // short-lived storage link; the auth token is never put in a URL.
  const openFile = async (mode: 'view' | 'download') => {
    // Open the tab inside the click so popup blockers allow it, then point it at the link.
    const tab = mode === 'view' ? window.open('', '_blank') : null;
    try {
      const { url } = await documentsService.getDownloadUrl(doc.id, mode === 'view');
      if (tab) {
        tab.location.href = url;
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      tab?.close();
      showToast('error', 'Error', 'Could not open this document.');
    }
  };

  const openPrimary = () => (isLink ? window.open(doc.file_url, '_blank', 'noopener,noreferrer') : openFile('view'));
  const menuItem = 'w-full flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors';

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,0.06))'
      }}
    >
      <div className="h-20 flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
        <Icon size={36} color={color} strokeWidth={1.5} />
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${bg}cc` }}>
          <div
            onClick={e => { e.stopPropagation(); openPrimary(); }}
            className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-110"
            style={{ background: color, color: '#fff' }}
            title={isLink ? 'Open link' : 'View file'}
          >
            {isLink ? <ExternalLink size={15} /> : <Eye size={15} />}
          </div>
          {!isLink && (
            <div
              onClick={e => { e.stopPropagation(); openFile('download'); }}
              className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-110"
              style={{ background: '#0f172a', color: '#fff' }}
              title="Download"
            >
              <Download size={15} />
            </div>
          )}
        </div>
        {doc.restrict_access && (
          <span
            className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: 'rgba(15,23,42,0.85)', color: '#fff' }}
            title="Only the people and roles it was shared with can see this"
          >
            <Lock size={9} /> Restricted
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-[12px] font-bold truncate mb-0.5" style={{ color: 'var(--text-primary)' }} title={doc.title}>
          {doc.title}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {isLink ? 'Link' : formatBytes(doc.file_size)} · {fmtDate(doc.created_at)}
        </p>
        {(doc.uploaded_by || doc.uploaded_by_email) && (
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            by {doc.uploaded_by ? `${doc.uploaded_by.first_name} ${doc.uploaded_by.last_name}` : doc.uploaded_by_email}
          </p>
        )}
      </div>

      <div className="absolute top-2 right-2">
        <Button
          onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
          aria-label="Document actions"
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <MoreVertical size={13} style={{ color: '#64748b' }} />
        </Button>
        {menuOpen && (
          <div
            className="absolute right-0 top-8 w-44 rounded-xl shadow-2xl z-20 overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <Button onClick={() => { openPrimary(); setMenuOpen(false); }} className={menuItem} style={{ color: 'var(--text-primary)' }}>
              <Eye size={13} /> {isLink ? 'Open link' : 'View'}
            </Button>
            {!isLink && (
              <Button onClick={() => { openFile('download'); setMenuOpen(false); }} className={menuItem} style={{ color: 'var(--text-primary)' }}>
                <Download size={13} /> Download
              </Button>
            )}
            {canManage && (
              <Button onClick={() => { onManage(doc); setMenuOpen(false); }} className={menuItem} style={{ color: 'var(--text-primary)' }}>
                <ShieldCheck size={13} /> Manage access
              </Button>
            )}
            {canManage && (
              <Button
                onClick={() => { onDelete(doc.id); setMenuOpen(false); }}
                disabled={deleting}
                className={`${menuItem} !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20`}
              >
                <Trash2 size={13} /> Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Share dialog: used for new uploads and for "Manage access" ─── */
interface ShareDialogProps {
  projectId: number;
  title: string;
  items: string[];
  initial: ShareValue;
  confirmLabel: string;
  busy: boolean;
  onConfirm: (v: ShareValue) => void;
  onClose: () => void;
}

function ShareDialog({ projectId, title, items, initial, confirmLabel, busy, onConfirm, onClose }: ShareDialogProps) {
  const [value, setValue] = useState<ShareValue>(initial);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
          <Button onClick={onClose} aria-label="Close"><X size={15} style={{ color: 'var(--text-muted)' }} /></Button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto">
          {items.length > 0 && (
            <ul className="text-[12px] space-y-1 max-h-24 overflow-y-auto" style={{ color: 'var(--text-primary)' }}>
              {items.map((n, i) => <li key={i} className="truncate">• {n}</li>)}
            </ul>
          )}
          <ShareWithPicker projectId={projectId} value={value} onChange={setValue} noun="file" />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="primary" onClick={() => onConfirm(value)} disabled={busy} className="!px-5 !h-10 !rounded-xl">
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main tab ────────────────────────────────────────────── */
interface ProjectDocumentsTabProps { projectId: number; }

export function ProjectDocumentsTab({ projectId }: ProjectDocumentsTabProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [managing, setManaging] = useState<Document | null>(null);
  const [savingShare, setSavingShare] = useState(false);

  const { data: docs = [], isLoading, refetch } = useQuery<Document[]>({
    queryKey: ['documents', projectId],
    queryFn: () => documentsService.getDocuments(0, 200, projectId),
    enabled: !!projectId,
  });

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // Choosing files only stages them: the uploader decides who can see them in the dialog first.
  const handleUpload = (files: FileList) => {
    const picked = Array.from(files);
    const tooBig = picked.filter(f => f.size > DOCUMENT_MAX_MB * 1024 * 1024);
    tooBig.forEach(f => showToast('error', 'Too large', `${f.name} is over ${DOCUMENT_MAX_MB} MB.`));
    const ok = picked.filter(f => f.size <= DOCUMENT_MAX_MB * 1024 * 1024);
    if (ok.length) setPendingFiles(ok);
  };

  const confirmUpload = async (sharing: ShareValue) => {
    setUploading(true);
    let successCount = 0;
    for (const file of pendingFiles) {
      try {
        await documentsService.createDocument(file, projectId, file.name, undefined, sharing);
        successCount++;
      } catch (e: any) {
        showToast('error', 'Upload Failed', e?.response?.data?.message || `Could not upload ${file.name}`);
      }
    }
    setUploading(false);
    setPendingFiles([]);
    if (successCount > 0) {
      showToast('success', 'Uploaded', `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully.`);
      refetch();
    }
  };

  const confirmManage = async (sharing: ShareValue) => {
    if (!managing) return;
    setSavingShare(true);
    try {
      await documentsService.updateSharing(managing.id, sharing);
      showToast('success', 'Access updated', 'Who can see this file has been changed.');
      setManaging(null);
      refetch();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.message || 'Could not change access.');
    } finally { setSavingShare(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await documentsService.deleteDocument(id);
      showToast('success', 'Deleted', 'Document removed.');
      refetch();
    } catch {
      showToast('error', 'Error', 'Failed to delete document.');
    } finally { setDeletingId(null); }
  };

  /* ── Stats strip ── */
  const totalSize = docs.reduce((s, d) => s + (d.file_size ?? 0), 0);
  const linkCount = docs.filter(d => d.file_type === 'url').length;
  const fileCount = docs.length - linkCount;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm, 0 1px 6px rgba(0,0,0,0.06))' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#B3F57B,#0CD1C3)' }}>
            <FolderOpen size={16} className="text-slate-900" />
          </div>
          <div>
            <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Project Documents</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {fileCount} file{fileCount !== 1 ? 's' : ''} · {linkCount} link{linkCount !== 1 ? 's' : ''} · {formatBytes(totalSize)} used
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 rounded-xl px-3 h-10 flex-1 min-w-[180px] max-w-xs"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <TextInput
            className="flex-1 bg-transparent text-[13px] outline-none"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <Button onClick={() => setSearch('')}><X size={12} style={{ color: 'var(--text-muted)' }} /></Button>}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Link2 size={13} />}
            onClick={() => setShowLinkModal(true)}
          >
            Add Link
          </Button>
          <label
            className="inline-flex items-center gap-2 px-4 h-9 rounded-xl font-bold text-[13px] text-slate-900 cursor-pointer transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)', boxShadow: '0 4px 14px rgba(12,209,195,0.3)' }}
          >
            <Upload size={13} />
            Upload Files
            <input
              type="file"
              multiple
              accept={DOCUMENT_ACCEPT}
              className="hidden"
              onChange={e => { if (e.target.files) handleUpload(e.target.files); e.target.value = ''; }}
            />
          </label>
        </div>
      </div>
      <DropZone onFiles={handleUpload} uploading={uploading} />
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div className="h-20" style={{ background: 'var(--border-color)' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded-full" style={{ background: 'var(--border-color)', width: '75%' }} />
                <div className="h-2 rounded-full" style={{ background: 'var(--border-color)', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <div
          className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-secondary)' }}>
            <FolderOpen size={32} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No results found' : 'No documents yet'}
          </p>
          <p className="text-[12px] mb-6" style={{ color: 'var(--text-muted)' }}>
            {search ? 'Try a different search term' : 'Upload files or add links to get started'}
          </p>
          {!search && (
            <label
              className="inline-flex items-center gap-2 px-5 h-10 rounded-xl font-bold text-[13px] text-slate-900 cursor-pointer transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #B3F57B 0%, #0CD1C3 100%)', boxShadow: '0 4px 14px rgba(12,209,195,0.25)' }}
            >
              <Upload size={14} />
              Upload First File
              <input
                type="file"
                multiple
                accept={DOCUMENT_ACCEPT}
                className="hidden"
                onChange={e => { if (e.target.files) handleUpload(e.target.files); e.target.value = ''; }}
              />
            </label>
          )}
        </div>
      )}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              onDelete={handleDelete}
              onManage={setManaging}
              deleting={deletingId === doc.id}
            />
          ))}
        </div>
      )}
      {pendingFiles.length > 0 && (
        <ShareDialog
          projectId={projectId}
          title={`Upload ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}`}
          items={pendingFiles.map(f => f.name)}
          initial={EVERYONE}
          confirmLabel="Upload"
          busy={uploading}
          onConfirm={confirmUpload}
          onClose={() => !uploading && setPendingFiles([])}
        />
      )}
      {managing && (
        <ShareDialog
          projectId={projectId}
          title="Manage access"
          items={[managing.title]}
          initial={{
            restrict_access: !!managing.restrict_access,
            role_ids: managing.shared_role_ids ?? [],
            user_ids: managing.shared_user_ids ?? [],
          }}
          confirmLabel="Save"
          busy={savingShare}
          onConfirm={confirmManage}
          onClose={() => setManaging(null)}
        />
      )}
      {showLinkModal && (
        <LinkModal
          projectId={projectId}
          onClose={() => setShowLinkModal(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
