'use client';

import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  onConfirm,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0f111a] border border-orange-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-full bg-orange-950/60 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-orange-500/30">
            Age Verification (18+)
          </span>
          <h3 className="text-xl font-bold text-white pt-1">
            Adult Content Notice
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            This section contains mature content intended exclusively for adults aged 18 and older.
            Please confirm your age to continue browsing and streaming.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onDecline}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/90 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Under 18 / Exit</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>I am 18 or older</span>
          </button>
        </div>
      </div>
    </div>
  );
};
