'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DNASliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function DNASlider({
  label,
  value,
  onChange,
  icon,
  color,
  description,
}: DNASliderProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className={`p-2 rounded-lg ${color}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.div>
          <div>
            <label className="text-sm font-semibold text-white">{label}</label>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <motion.span
          className="text-2xl font-bold text-quantum-400"
          key={value}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {value}%
        </motion.span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-quantum-400
                     [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(14,165,233,0.8)]
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-quantum-400
                     [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(14,165,233,0.8)]"
        />
        <motion.div
          className="absolute top-0 left-0 h-2 rounded-lg pointer-events-none"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color.includes('pink') ? '#ff00ff' : color.includes('cyan') ? '#00ffff' : color.includes('green') ? '#00ff00' : '#0ea5e9'}, transparent)`,
          }}
          initial={false}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

interface WebGPUStatusProps {
  isSupported: boolean | null;
  isLowPowerMode: boolean;
}

export function WebGPUStatus({ isSupported, isLowPowerMode }: WebGPUStatusProps) {
  if (isSupported === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs">
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-gray-300">Checking WebGPU...</span>
      </div>
    );
  }

  if (!isSupported || isLowPowerMode) {
    return (
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full low-power-badge text-xs font-semibold"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        title="WebGPU not available - using WASM fallback"
      >
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="text-black">LOW POWER MODE</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-quantum-500/20 border border-quantum-400/30 text-xs"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-quantum-400"
        animate={{ boxShadow: ['0 0 5px #0ea5e9', '0 0 15px #0ea5e9', '0 0 5px #0ea5e9'] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-quantum-300">WebGPU Active</span>
    </motion.div>
  );
}

export function IncubationButton({
  onClick,
  disabled,
  isGenerating,
}: {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isGenerating}
      className={cn(
        'relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isGenerating
          ? 'bg-gray-600'
          : 'bg-gradient-to-r from-quantum-500 to-purple-600 hover:from-quantum-400 hover:to-purple-500'
      )}
      whileHover={!disabled && !isGenerating ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isGenerating ? { scale: 0.98 } : {}}
    >
      {isGenerating ? (
        <div className="flex items-center gap-3">
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>INCUBATING...</span>
        </div>
      ) : (
        <span className="relative z-10">GENERATE CREATURE</span>
      )}
      
      {!isGenerating && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-500 via-cyan-500 to-pink-500 opacity-0"
          animate={{ opacity: disabled ? 0 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}
