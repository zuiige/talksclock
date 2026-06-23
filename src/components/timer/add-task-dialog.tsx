'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, durationSeconds: number) => void;
  defaultName?: string;
}

export function AddTaskDialog({ open, onOpenChange, onAdd, defaultName = '' }: AddTaskDialogProps) {
  const [name, setName] = useState(defaultName || '');
  const [minutes, setMinutes] = useState('10');
  const [seconds, setSeconds] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = parseInt(minutes || '0') * 60 + parseInt(seconds || '0');
    if (totalSeconds > 0 && name.trim()) {
      onAdd(name.trim(), totalSeconds);
      setName('');
      setMinutes('10');
      setSeconds('0');
      onOpenChange(false);
    }
  };

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(defaultName || '');
      setMinutes('10');
      setSeconds('0');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">添加演讲环节</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm text-white/60">环节名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：开场白、主题演讲、Q&A"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/60">时长</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  min={0}
                  max={999}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-white/30 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">分钟</span>
              </div>
              <div className="flex-1 relative">
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-white/30 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">秒</span>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <label className="text-sm text-white/60">快速选择</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '3分钟', m: 3, s: 0 },
                { label: '5分钟', m: 5, s: 0 },
                { label: '10分钟', m: 10, s: 0 },
                { label: '15分钟', m: 15, s: 0 },
                { label: '20分钟', m: 20, s: 0 },
                { label: '30分钟', m: 30, s: 0 },
                { label: '45分钟', m: 45, s: 0 },
                { label: '60分钟', m: 60, s: 0 },
              ].map((preset) => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMinutes(String(preset.m));
                    setSeconds(String(preset.s));
                  }}
                  className="h-7 border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-500/80 hover:bg-green-500 text-white"
            disabled={!name.trim() || (parseInt(minutes || '0') * 60 + parseInt(seconds || '0')) <= 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加环节
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
