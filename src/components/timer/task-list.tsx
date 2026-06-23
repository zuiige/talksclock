'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';
import type { TimerTask } from '@/lib/timer-types';
import { formatTime } from '@/lib/timer-types';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: TimerTask[];
  activeTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: () => void;
  onRemoveTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<TimerTask>) => void;
  onReorderTasks: (tasks: TimerTask[]) => void;
}

function getStatusLabel(status: TimerTask['status']): string {
  switch (status) {
    case 'idle': return '就绪';
    case 'running': return '运行中';
    case 'paused': return '已暂停';
    case 'completed': return '已完成';
  }
}

function getStatusColor(status: TimerTask['status']): string {
  switch (status) {
    case 'idle': return 'text-white/40';
    case 'running': return 'text-green-400';
    case 'paused': return 'text-amber-400';
    case 'completed': return 'text-white/60';
  }
}

// Sortable task item
function SortableTaskItem({
  task,
  isActive,
  onSelect,
  onRemove,
}: {
  task: TimerTask;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : undefined,
  };

  const { minutes, seconds } = formatTime(task.remaining);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all',
        isActive
          ? 'bg-white/10 ring-1 ring-white/15'
          : 'hover:bg-white/5',
        isDragging && 'shadow-lg shadow-black/40 bg-[#1a1a2e] ring-1 ring-white/20'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-white' : 'text-white/70'
          )}>
            {task.name}
          </span>
          <span className={cn('text-[10px] font-medium', getStatusColor(task.status))}>
            {getStatusLabel(task.status)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-mono tabular-nums text-white/40">
            {minutes}:{seconds}
          </span>
          <span className="text-[10px] text-white/25">
            / {Math.floor(task.duration / 60)}分{task.duration % 60 > 0 ? `${task.duration % 60}秒` : '钟'}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function TaskList({ tasks, activeTaskId, onSelectTask, onAddTask, onRemoveTask, onUpdateTask, onReorderTasks }: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(tasks, oldIndex, newIndex);
      onReorderTasks(reordered);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-1 mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">演讲环节</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTask}
          className="h-7 gap-1 text-xs text-white/50 hover:text-white hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
          添加
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 -mx-1">
        <div className="space-y-1.5 px-1">
          {tasks.length === 0 && (
            <div className="py-8 text-center text-sm text-white/30">
              <Clock className="mx-auto mb-2 h-8 w-8 opacity-40" />
              <p>暂无倒计时任务</p>
              <p className="mt-1 text-xs">点击上方添加按钮创建</p>
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  isActive={task.id === activeTaskId}
                  onSelect={() => onSelectTask(task.id)}
                  onRemove={() => onRemoveTask(task.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>

      {/* Quick add inline */}
      <div className="mt-3 border-t border-white/5 pt-3">
        <QuickAdd onAdd={onAddTask} />
      </div>
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: () => void }) {
  return (
    <Button
      variant="outline"
      className="w-full border-dashed border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 hover:border-white/20"
      onClick={onAdd}
    >
      <Plus className="h-4 w-4 mr-2" />
      添加新环节
    </Button>
  );
}

export function TaskFormInline({ onAdd }: { onAdd: (name: string, durationSeconds: number) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const minutes = parseInt(formData.get('minutes') as string) || 0;
    const seconds = parseInt(formData.get('seconds') as string) || 0;
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0 && name.trim()) {
      onAdd(name.trim(), totalSeconds);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        name="name"
        placeholder="环节名称，如：开场白"
        className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
      />
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            name="minutes"
            type="number"
            min={0}
            max={999}
            placeholder="分钟"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">分</span>
        </div>
        <div className="flex-1 relative">
          <Input
            name="seconds"
            type="number"
            min={0}
            max={59}
            placeholder="秒数"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">秒</span>
        </div>
      </div>
      <Button type="submit" className="w-full bg-green-500/80 hover:bg-green-500 text-white">
        <Plus className="h-4 w-4 mr-1" />
        添加环节
      </Button>
    </form>
  );
}
