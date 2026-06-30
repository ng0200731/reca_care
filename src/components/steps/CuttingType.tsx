"use client";

import { useLayoutStore } from "@/store/layoutStore";
import type { CuttingType } from "@/lib/types";

export default function CuttingTypeStep() {
  const cuttingType = useLayoutStore((s) => s.data.cuttingType);
  const setCuttingType = useLayoutStore((s) => s.setCuttingType);
  const setStep = useLayoutStore((s) => s.setStep);

  const options: { value: CuttingType; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: "piece",
      label: "Piece Form",
      desc: "Single flat label piece, no folding",
      icon: (
        <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="7" width="18" height="10" rx="2" />
        </svg>
      ),
    },
    {
      value: "loop",
      label: "Loop Form",
      desc: "Folded label that wraps around fabric",
      icon: (
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          {/* Front panel */}
          <path d="M5 7h7v10H5z" />
          {/* Back panel folded behind (perspective) */}
          <path d="M12 7l6-2v10l-6 2z" />
          {/* Fold line */}
          <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2" />
          {/* Label content lines */}
          <line x1="7" y1="10" x2="10" y2="10" />
          <line x1="7" y1="12" x2="10" y2="12" />
          <line x1="7" y1="14" x2="10" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Cutting Type</h2>
        <p className="text-sm text-[var(--foreground)]/50 mt-1">Choose how the label will be cut and folded</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => {
          const isSelected = cuttingType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setCuttingType(opt.value)}
              className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-[var(--shadow-md)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-sm)]"
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-200 ${
                isSelected ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--foreground)]/60"
              }`}>
                {opt.icon}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--foreground)]">{opt.label}</p>
                <p className="text-xs text-[var(--foreground)]/50 mt-1">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep("size")} className="px-6 py-2.5 text-sm font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--muted)] transition-all duration-200 cursor-pointer">
          Back
        </button>
        <button
          onClick={() => setStep(cuttingType === "loop" ? "loop-details" : "padding")}
          className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
