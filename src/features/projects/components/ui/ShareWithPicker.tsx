import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Globe, Lock } from 'lucide-react';
import { mastersApi } from '@/api/services/masters.service';
import { projectsService } from '@/api/services/projects.service';
import { SHARE_COPY } from '@/features/projects/constants/sharing';

export interface ShareValue {
  restrict_access: boolean;
  role_ids: number[];
  user_ids: number[];
}

export const EVERYONE: ShareValue = { restrict_access: false, role_ids: [], user_ids: [] };

interface Props {
  projectId: number;
  value: ShareValue;
  onChange: (v: ShareValue) => void;
  /** Singular noun used in the helper text, e.g. "file" or "credential". */
  noun?: string;
}

const toggle = (list: number[], id: number) =>
  list.includes(id) ? list.filter(x => x !== id) : [...list, id];

/**
 * "Who can see this?" - everyone on the project, or only chosen roles / people. Used when
 * uploading a document, when changing its access later, and for project credentials.
 * The server enforces it; this only collects the choice.
 */
export function ShareWithPicker({ projectId, value, onChange, noun = 'file' }: Props) {
  const { data: roles = [] } = useQuery({ queryKey: ['masters', 'roles'], queryFn: () => mastersApi.getRoles() });
  const { data: membersRaw } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectsService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const members = useMemo(() => {
    const items: any[] = Array.isArray(membersRaw) ? membersRaw : (membersRaw as any)?.items ?? [];
    return items
      .map(m => ({
        id: (m.user_id ?? m.user?.id) as number,
        name: [m.user?.first_name, m.user?.last_name].filter(Boolean).join(' ') || m.user?.email || `User ${m.user_id}`,
        sub: m.project_profile || m.role_in_project || '',
      }))
      .filter(m => m.id != null);
  }, [membersRaw]);

  const optionBase = 'flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors';
  const pill = (on: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-[12px] font-bold cursor-pointer select-none border transition-colors ${
      on ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300' : 'border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
    }`;

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Who can see this {noun}?
      </p>

      <label className={optionBase} style={{ border: `1px solid ${!value.restrict_access ? '#0CD1C3' : 'var(--border-color)'}` }}>
        <input
          type="radio"
          name={`share-mode-${noun}`}
          className="mt-1"
          checked={!value.restrict_access}
          onChange={() => onChange({ ...value, restrict_access: false })}
        />
        <Globe size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        <span>
          <span className="block text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{SHARE_COPY.everyone.title}</span>
          <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>{SHARE_COPY.everyone.hint}</span>
        </span>
      </label>

      <label className={optionBase} style={{ border: `1px solid ${value.restrict_access ? '#0CD1C3' : 'var(--border-color)'}` }}>
        <input
          type="radio"
          name={`share-mode-${noun}`}
          className="mt-1"
          checked={value.restrict_access}
          onChange={() => onChange({ ...value, restrict_access: true })}
        />
        <Lock size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        <span>
          <span className="block text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{SHARE_COPY.restricted.title}</span>
          <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>{SHARE_COPY.restricted.hint}</span>
        </span>
      </label>

      {value.restrict_access && (
        <div className="space-y-3 pl-1">
          <div>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Roles</p>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <label key={r.id} className={pill(value.role_ids.includes(r.id))}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={value.role_ids.includes(r.id)}
                    onChange={() => onChange({ ...value, role_ids: toggle(value.role_ids, r.id) })}
                  />
                  {r.name}
                </label>
              ))}
              {roles.length === 0 && <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No roles found.</span>}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>People on this project</p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {members.map(m => (
                <label key={m.id} className={pill(value.user_ids.includes(m.id))} title={m.sub}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={value.user_ids.includes(m.id)}
                    onChange={() => onChange({ ...value, user_ids: toggle(value.user_ids, m.id) })}
                  />
                  {m.name}
                </label>
              ))}
              {members.length === 0 && <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No project members yet.</span>}
            </div>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {value.role_ids.length + value.user_ids.length === 0
              ? `With nothing selected, only you and Admins can see this ${noun}.`
              : `You and Admins can always see it. Shared roles still need access to this project.`}
          </p>
        </div>
      )}
    </div>
  );
}
