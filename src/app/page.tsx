'use client';

import { useCallback, useEffect, useState } from 'react';
import { CountdownDisplay } from '@/components/timer/countdown-display';
import { ControlPanel } from '@/components/timer/control-panel';
import { TaskList, TaskFormInline } from '@/components/timer/task-list';
import { StyleSwitcher, SoundToggle, SettingsPanel } from '@/components/timer/settings-panel';
import { AddTaskDialog } from '@/components/timer/add-task-dialog';
import { useCountdown } from '@/hooks/use-countdown';
import { useAudio } from '@/hooks/use-audio';
import { createTask } from '@/lib/timer-types';
import type { TimerTask, DisplayStyle } from '@/lib/timer-types';
import { Timer, ChevronLeft, ChevronRight, Maximize2, Minimize2, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Default preset tasks for a typical speech
const DEFAULT_TASKS: Array<{ name: string; duration: number }> = [
  { name: '开场白', duration: 180 },
  { name: '主题演讲', duration: 1200 },
  { name: '互动问答', duration: 600 },
  { name: '总结收尾', duration: 300 },
];

export default function TimerPage() {
  const [mounted, setMounted] = useState(false);

  // All state initialized after mount to avoid hydration mismatch
  // (crypto.randomUUID(), Date.now(), window.innerWidth differ between SSR and client)
  useEffect(() => {
    setMounted(true);
  }, []);

  const [tasks, setTasks] = useState<TimerTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('classic');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [warnAtPercent, setWarnAtPercent] = useState(20);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize default tasks on client only (uses crypto.randomUUID)
  useEffect(() => {
    if (!mounted) return;
    const initial = DEFAULT_TASKS.map((t) => createTask(t.name, t.duration));
    setTasks(initial);
    setActiveTaskId(initial.length > 0 ? initial[0].id : null);
  }, [mounted]);

  // Detect mobile screen
  useEffect(() => {
    if (!mounted) return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? tasks[0] ?? null;

  const { playWarnSound, playCompleteSound } = useAudio();

  const handleUpdateTask = useCallback((id: string, updates: Partial<TimerTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const handleAddTask = useCallback((name: string, durationSeconds: number) => {
    const newTask = createTask(name, durationSeconds);
    setTasks((prev) => [...prev, newTask]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  }, [activeTaskId]);

  const handleRemoveTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setActiveTaskId((prev) => {
      if (prev === id) {
        const remaining = tasks.filter((t) => t.id !== id);
        return remaining.length > 0 ? remaining[0].id : null;
      }
      return prev;
    });
  }, [tasks]);

  const handleSelectTask = useCallback((id: string) => {
    setActiveTaskId(id);
    // Close sidebar on mobile after selection
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleClearAll = useCallback(() => {
    setTasks([]);
    setActiveTaskId(null);
    setShowClearConfirm(false);
  }, []);

  // Warn threshold in milliseconds
  const warnAtMs = activeTask ? (warnAtPercent / 100) * activeTask.duration * 1000 : 60000;

  // Use countdown hook — use stable empty task object to avoid crypto.randomUUID() on SSR
  const emptyTask: TimerTask = {
    id: '__empty__',
    name: '',
    duration: 0,
    remaining: 0,
    status: 'idle',
    startedAt: null,
    pausedRemaining: null,
  };

  const countdown = useCountdown(
    activeTask ?? emptyTask,
    handleUpdateTask,
    {
      onWarn: () => {
        if (soundEnabled) playWarnSound();
      },
      onComplete: () => {
        if (soundEnabled) playCompleteSound();
      },
      warnAtMs,
    }
  );

  // Navigate between tasks
  const activeIndex = tasks.findIndex((t) => t.id === activeTaskId);
  const handlePrevTask = useCallback(() => {
    if (activeIndex > 0) {
      setActiveTaskId(tasks[activeIndex - 1].id);
    }
  }, [activeIndex, tasks]);

  const handleNextTask = useCallback(() => {
    if (activeIndex < tasks.length - 1) {
      setActiveTaskId(tasks[activeIndex + 1].id);
    }
  }, [activeIndex, tasks]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (countdown.status === 'running') {
            countdown.pause();
          } else {
            countdown.start();
          }
          break;
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            countdown.reset();
          }
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          handlePrevTask();
          break;
        case 'ArrowRight':
          handleNextTask();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [countdown, handlePrevTask, handleNextTask, toggleFullscreen]);

  // Task overview bar (mini progress indicators for all tasks)
  const taskOverview = (
    <div className="flex items-center gap-1.5">
      {tasks.map((task) => {
        const isActive = task.id === activeTaskId;
        let color = 'bg-white/20';
        if (task.status === 'running') color = 'bg-green-400';
        else if (task.status === 'paused') color = 'bg-amber-400';
        else if (task.status === 'completed') color = 'bg-white/40';

        return (
          <button
            key={task.id}
            onClick={() => handleSelectTask(task.id)}
            className={`h-1.5 rounded-full transition-all ${color} ${isActive ? 'w-8' : 'w-4'} hover:opacity-80`}
            title={task.name}
          />
        );
      })}
    </div>
  );

  // Sidebar content shared between mobile Sheet and desktop aside
  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-green-400" />
          <h1 className="font-semibold text-white/90">演讲计时器</h1>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-3 py-3">
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectTask={handleSelectTask}
          onAddTask={() => setAddDialogOpen(true)}
          onRemoveTask={handleRemoveTask}
          onUpdateTask={handleUpdateTask}
        />
      </div>

      {/* Bottom actions */}
      <div className="border-t border-white/5 px-3 py-3 space-y-2">
        <TaskFormInline onAdd={handleAddTask} />
        {tasks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="w-full text-red-400/60 hover:text-red-400 hover:bg-red-400/10 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            清空所有环节
          </Button>
        )}
      </div>
    </>
  );

  // Hydration guard: don't render dynamic content until client-side mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <Timer className="h-10 w-10 text-green-400 animate-pulse" />
          <span className="text-sm text-white/30">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && sidebarOpen && (
        <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-[#0f0f1a] flex flex-col min-h-0">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 bg-[#0f0f1a] border-white/5 text-white p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8 flex-shrink-0 text-white/30 hover:text-white hover:bg-white/10"
            >
              {isMobile ? <Menu className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Timer className="h-4 w-4 text-green-400 hidden sm:block" />
              <span className="text-sm font-medium text-white/60 hidden sm:inline">演讲计时器</span>
            </div>
            <div className="min-w-0">{taskOverview}</div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1">
              <StyleSwitcher currentStyle={displayStyle} onStyleChange={setDisplayStyle} />
              <div className="w-px h-5 bg-white/10 mx-1" />
            </div>
            <SoundToggle enabled={soundEnabled} onToggle={setSoundEnabled} />
            <SettingsPanel
              soundEnabled={soundEnabled}
              onSoundToggle={setSoundEnabled}
              displayStyle={displayStyle}
              onStyleChange={setDisplayStyle}
              warnAtPercent={warnAtPercent}
              onWarnAtPercentChange={setWarnAtPercent}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10"
              title="全屏 (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Countdown Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 px-4 py-4">
          {/* Task navigation */}
          {tasks.length > 1 && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevTask}
                disabled={activeIndex <= 0}
                className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/30 font-mono tabular-nums">
                {activeIndex + 1} / {tasks.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextTask}
                disabled={activeIndex >= tasks.length - 1}
                className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {activeTask ? (
            <CountdownDisplay
              remaining={countdown.remaining}
              duration={activeTask.duration}
              displayStyle={displayStyle}
              taskName={activeTask.name}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-white/30">
              <Timer className="h-16 w-16 opacity-30" />
              <p className="text-lg">尚未添加倒计时任务</p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="bg-green-500/80 hover:bg-green-500 text-white"
              >
                添加第一个环节
              </Button>
            </div>
          )}

          {/* Controls */}
          {activeTask && (
            <ControlPanel
              status={countdown.status}
              onStart={countdown.start}
              onPause={countdown.pause}
              onReset={countdown.reset}
              onSkip={tasks.length > 1 ? handleNextTask : undefined}
              hasMultipleTasks={tasks.length > 1}
            />
          )}

          {/* Keyboard hints - desktop only */}
          <div className="hidden md:flex gap-4 text-[10px] text-white/15 mt-2">
            <span>空格 开始/暂停</span>
            <span>R 重置</span>
            <span>F 全屏</span>
            <span>← → 切换环节</span>
          </div>
        </div>
      </main>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddTask}
      />

      {/* Clear All Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent className="bg-[#1a1a2e] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认清空</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              将删除所有倒计时环节，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-red-500/80 hover:bg-red-500 text-white">
              清空全部
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
