import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { useToast } from '@/providers/ToastContext';
import { tasksService, Task } from '@/api/services/tasks.service';
import { mastersApi } from '@/api/services/masters.service';
import { STATUS_COMPLETED, STATUS_OPEN, SUBTASK_NAME_MAX } from '@/features/projects/constants/sharing';

interface Props {
  parent: Task;
  canCreate: boolean;
  canEdit: boolean;
}

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase();
const isDone = (t: any) => norm(t.status_master?.value ?? t.status_master?.label) === STATUS_COMPLETED;
const owner = (t: any) => {
  const o = t.assignee || t.single_owner || (t.owners?.length ? t.owners[0] : null);
  return o ? [o.first_name, o.last_name].filter(Boolean).join(' ') : 'Unassigned';
};

/**
 * Sub-tasks of one task. Tasks nest two levels only, so this panel is shown on top-level tasks.
 * A sub-task is a normal task (own owner, status, hours); it lives in its parent's project/list.
 */
export function SubtasksPanel({ parent, canCreate, canEdit }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'subtasks', parent.id],
    queryFn: () => tasksService.getTasks({ parent_task_id: parent.id, skip: 0, limit: 200 }),
  });
  const { data: statuses = [] } = useQuery({
    queryKey: ['masters', 'lookups', 'TaskStatus'],
    queryFn: () => mastersApi.getLookups('TaskStatus'),
  });

  const subtasks: Task[] = (data?.items ?? []).slice().sort((a, b) => a.id - b.id);
  const done = subtasks.filter(isDone).length;
  const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;
  const statusId = (key: string) =>
    (statuses as any[]).find(s => norm(s.value) === key || norm(s.label) === key)?.id as number | undefined;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
  };

  const add = async () => {
    const taskName = name.trim();
    if (!taskName) return;
    setAdding(true);
    try {
      // project, list and milestone are taken from the parent by the server
      await tasksService.createTask({ task_name: taskName, parent_task_id: parent.id, project_id: parent.project_id });
      setName('');
      refresh();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.message || 'Could not add the sub-task.');
    } finally { setAdding(false); }
  };

  const toggle = async (t: Task) => {
    const target = statusId(isDone(t) ? STATUS_OPEN : STATUS_COMPLETED);
    if (!target) { showToast('error', 'Error', 'Task statuses are not loaded yet.'); return; }
    setBusyId(t.id);
    try {
      await tasksService.updateTask(t.id, { status_id: target });
      refresh();
    } catch (e: any) {
      showToast('error', 'Error', e?.response?.data?.message || 'Could not change the status.');
    } finally { setBusyId(null); }
  };

  return (
    <div className="space-y-4 p-1">
      <div>
        <div className="flex items-center justify-between text-[12px] mb-1.5">
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {subtasks.length === 0 ? 'No sub-tasks yet' : `${done} of ${subtasks.length} done`}
          </span>
          {subtasks.length > 0 && <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'hsl(160 60% 45%)' }} />
        </div>
      </div>

      {isLoading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading…</p>}

      <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {subtasks.map(t => (
          <li key={t.id} className="flex items-center gap-3 py-2.5">
            <button
              type="button"
              disabled={!canEdit || busyId === t.id}
              onClick={() => toggle(t)}
              aria-label={isDone(t) ? 'Mark as open' : 'Mark as completed'}
              className="bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {isDone(t)
                ? <CheckCircle2 size={18} style={{ color: 'hsl(160 60% 45%)' }} />
                : <Circle size={18} style={{ color: 'var(--text-muted)' }} />}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tasks/${t.id}`, { state: { from: `/tasks/${parent.id}` } })}
              className="flex-1 min-w-0 text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              <span
                className={`block truncate text-[13px] font-semibold ${isDone(t) ? 'line-through opacity-60' : ''}`}
                style={{ color: 'var(--text-primary)' }}
              >
                {t.task_name}
              </span>
              <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {owner(t)}{t.due_date ? ` · due ${String(t.due_date).slice(0, 10)}` : ''}
              </span>
            </button>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {t.status_master?.label ?? ''}
            </span>
          </li>
        ))}
      </ul>

      {canCreate && (
        <form
          className="flex items-center gap-2"
          onSubmit={e => { e.preventDefault(); add(); }}
        >
          <TextInput
            className="flex-1 rounded-xl px-4 h-10 text-[13px] bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] outline-none focus:border-teal-500"
            placeholder="Add a sub-task and press Enter…"
            maxLength={SUBTASK_NAME_MAX}
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="New sub-task name"
          />
          <Button type="submit" variant="primary" size="sm" icon={<Plus size={13} />} disabled={adding || !name.trim()}>Add</Button>
        </form>
      )}
    </div>
  );
}
