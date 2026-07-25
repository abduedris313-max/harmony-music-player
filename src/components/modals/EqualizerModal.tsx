import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Save, Check, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const {
    isEqEnabled,
    setEqEnabled,
    eqPreset,
    setEqPreset,
    eqBands,
    setEqBandGain,
    eqPreamp,
    setEqPreampGain,
    customPresets,
    saveCustomEqPreset,
    resetEqToDefault
  } = useAudio();

  const [customName, setCustomName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  if (!isOpen) return null;

  const bandLabels = [
    { name: '60 Hz', sub: 'Bass' },
    { name: '230 Hz', sub: 'Low Mid' },
    { name: '910 Hz', sub: 'Mid' },
    { name: '4 kHz', sub: 'High Mid' },
    { name: '14 kHz', sub: 'Treble' }
  ];

  const presetsList = [
    'Normal',
    'Pop',
    'Rock',
    'Jazz',
    'Classical',
    'Bass Boost',
    'Vocal',
    ...customPresets.map(p => p.name)
  ];

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    saveCustomEqPreset(customName.trim());
    setCustomName('');
    setShowSaveInput(false);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Audio Equalizer
                {isEqEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                DSP Audio Frequency Tuning & Custom Filters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Power Switch */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-rose-500" />
            <div>
              <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                Equalizer Processing
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {isEqEnabled ? 'Audio signal processing active' : 'Bypass equalizer'}
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEqEnabled}
              onChange={(e) => setEqEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Preset Profile
            </label>
            <button
              onClick={resetEqToDefault}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {presetsList.map((preset) => {
              const isSelected = eqPreset === preset;
              return (
                <button
                  key={preset}
                  onClick={() => setEqPreset(preset)}
                  disabled={!isEqEnabled}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all truncate border ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  } ${!isEqEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preamp Control Slider */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-300">Preamp Gain</span>
            <span className="font-mono text-rose-500">
              {eqPreamp > 0 ? `+${eqPreamp.toFixed(1)}` : eqPreamp.toFixed(1)} dB
            </span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            disabled={!isEqEnabled}
            value={eqPreamp}
            onChange={(e) => setEqPreampGain(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* 5-Band Vertical Frequency Sliders */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Frequency Bands (-12dB to +12dB)
          </label>
          <div className="grid grid-cols-5 gap-3 pt-2 pb-2 items-center justify-items-center">
            {bandLabels.map((b, idx) => {
              const bandGain = eqBands[idx] || 0;
              return (
                <div key={b.name} className="flex flex-col items-center gap-3">
                  <span className="text-[11px] font-mono font-bold text-rose-500 min-h-[16px]">
                    {bandGain > 0 ? `+${bandGain}` : bandGain}dB
                  </span>

                  {/* Vertical Range Slider Container */}
                  <div className="h-36 flex items-center justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      disabled={!isEqEnabled}
                      value={bandGain}
                      onChange={(e) => setEqBandGain(idx, parseFloat(e.target.value))}
                      className="accent-rose-500 h-32 w-2 appearance-none bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer disabled:opacity-50 -rotate-90 transform"
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      {b.sub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Preset Save Area */}
        {showSaveInput ? (
          <form onSubmit={handleSaveSubmit} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              required
              placeholder="Preset Name (e.g., Heavy Bass)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              type="button"
              onClick={() => setShowSaveInput(false)}
              className="px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setShowSaveInput(true)}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-rose-500" />
              Save As Custom Preset
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-500/20"
            >
              Done
            </button>
          </div>
        )}

        {/* Success Toast */}
        {savedSuccessToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            Preset saved successfully!
          </div>
        )}

      </div>
    </div>
  );
};
