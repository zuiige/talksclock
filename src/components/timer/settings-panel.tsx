'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Palette, Settings2 } from 'lucide-react';
import type { DisplayStyle } from '@/lib/timer-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StyleSwitcherProps {
  currentStyle: DisplayStyle;
  onStyleChange: (style: DisplayStyle) => void;
}

const STYLES: { value: DisplayStyle; label: string; desc: string }[] = [
  { value: 'classic', label: '经典', desc: '环形进度 + 数字' },
  { value: 'minimal', label: '极简', desc: '全屏大字体' },
  { value: 'progress', label: '进度条', desc: '横条进度 + 数字' },
];

export function StyleSwitcher({ currentStyle, onStyleChange }: StyleSwitcherProps) {
  return (
    <div className="flex items-center gap-1">
      <Palette className="h-4 w-4 text-white/40 mr-1" />
      {STYLES.map((style) => (
        <Button
          key={style.value}
          variant="ghost"
          size="sm"
          onClick={() => onStyleChange(style.value)}
          className={cn(
            'h-8 px-2.5 text-xs transition-all rounded-md',
            currentStyle === style.value
              ? 'bg-white/15 text-white'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          )}
        >
          {style.label}
        </Button>
      ))}
    </div>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

interface SoundToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Volume2 className="h-4 w-4 text-white/50" />
      ) : (
        <VolumeX className="h-4 w-4 text-white/30" />
      )}
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-green-500/60 data-[state=unchecked]:bg-white/15"
      />
    </div>
  );
}

interface SettingsPanelProps {
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  displayStyle: DisplayStyle;
  onStyleChange: (style: DisplayStyle) => void;
  warnAtPercent: number;
  onWarnAtPercentChange: (percent: number) => void;
}

export function SettingsPanel({
  soundEnabled,
  onSoundToggle,
  displayStyle,
  onStyleChange,
  warnAtPercent,
  onWarnAtPercentChange,
}: SettingsPanelProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/10">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a2e] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {/* Display style */}
          <div className="space-y-3">
            <Label className="text-white/70 text-sm">显示样式</Label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => onStyleChange(style.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                    displayStyle === style.value
                      ? 'border-green-500/50 bg-green-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                  )}
                >
                  <span className="text-sm font-medium">{style.label}</span>
                  <span className="text-[10px] opacity-60">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/70 text-sm">声音提醒</Label>
              <Switch
                checked={soundEnabled}
                onCheckedChange={onSoundToggle}
                className="data-[state=checked]:bg-green-500/60 data-[state=unchecked]:bg-white/15"
              />
            </div>
            {soundEnabled && (
              <p className="text-xs text-white/40">
                时间不足时播放提示音，倒计时结束时播放完成音
              </p>
            )}
          </div>

          {/* Warning threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/70 text-sm">预警阈值</Label>
              <span className="text-xs font-mono text-white/50">{warnAtPercent}%</span>
            </div>
            <Slider
              value={[warnAtPercent]}
              min={5}
              max={50}
              step={5}
              onValueChange={([v]) => onWarnAtPercentChange(v)}
              className="py-2"
            />
            <p className="text-xs text-white/30">
              剩余时间低于此百分比时，显示琥珀色警告
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
