"use client";

import { useLayoutStore } from "@/store/layoutStore";

const steps = [
  { id: "material", label: "Material" },
  { id: "size", label: "Size & Orientation" },
  { id: "cutting", label: "Cutting Type" },
  { id: "loop-details", label: "Loop Details" },
  { id: "padding", label: "Padding" },
  { id: "final", label: "Final View" },
] as const;

export default function LeftMenu({ onNavigate }: { onNavigate?: () => void }) {
  const step = useLayoutStore((s) => s.step);
  const setStep = useLayoutStore((s) => s.setStep);
  const viewPanel = useLayoutStore((s) => s.viewPanel);
  const setViewPanel = useLayoutStore((s) => s.setViewPanel);
  const data = useLayoutStore((s) => s.data);
  const savedLayouts = useLayoutStore((s) => s.savedLayouts);

  const stepOrder = steps.map((s) => s.id);
  const currentIdx = stepOrder.indexOf(step);

  const handleSetViewPanel = (panel: "layout-create" | "layout-view") => {
    setViewPanel(panel);
    onNavigate?.();
  };

  const handleSetStep = (id: typeof steps[number]["id"]) => {
    setStep(id);
    onNavigate?.();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-[var(--border)] overflow-y-auto">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-[var(--foreground)] leading-tight">WashCare Label</h1>
            <p className="text-xs text-[var(--foreground)]/50">Design Studio</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-2 px-3">
          <span className="text-[11px] font-semibold text-[var(--foreground)]/40 uppercase tracking-wider">
            Workspace
          </span>
        </div>

        <div className="space-y-1 mb-6">
          <button
            onClick={() => handleSetViewPanel("layout-create")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              viewPanel === "layout-create"
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
          <button
            onClick={() => handleSetViewPanel("layout-view")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              viewPanel === "layout-view"
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Saved Layouts
            {savedLayouts.length > 0 && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                {savedLayouts.length}
              </span>
            )}
          </button>
        </div>

        {viewPanel === "layout-create" && (
          <>
            <div className="mb-2 px-3 mt-6">
              <span className="text-[11px] font-semibold text-[var(--foreground)]/40 uppercase tracking-wider">
                Steps
              </span>
            </div>
            <div className="space-y-1">
              {steps.map((s, idx) => {
                const isActive = s.id === step;
                const isPast = idx < currentIdx;
                const isDisabled = s.id === "loop-details" && data.cuttingType !== "loop";
                return (
                  <button
                    key={s.id}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSetStep(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                        : isPast
                        ? "text-[var(--foreground)]/80 hover:bg-[var(--muted)] cursor-pointer"
                        : isDisabled
                        ? "text-[var(--foreground)]/30 cursor-not-allowed"
                        : "text-[var(--foreground)]/50 hover:bg-[var(--muted)] hover:text-[var(--foreground)]/70 cursor-pointer"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${
                        isActive
                          ? "bg-[var(--primary)] text-white"
                          : isPast
                          ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                          : "bg-[var(--muted)] text-[var(--foreground)]/40"
                      }`}
                    >
                      {isPast ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {viewPanel === "layout-view" && (
          <>
            <div className="mb-2 px-3 mt-6">
              <span className="text-[11px] font-semibold text-[var(--foreground)]/40 uppercase tracking-wider">
                Recent
              </span>
            </div>
            {savedLayouts.length === 0 ? (
              <p className="text-sm text-[var(--foreground)]/40 italic pl-3">No saved layouts</p>
            ) : (
              <div className="space-y-1">
                {savedLayouts.map((l) => (
                  <div
                    key={l.id}
                    className="px-3 py-2 rounded-lg text-sm text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer truncate transition-colors duration-200"
                    title={l.name}
                  >
                    {l.name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="text-[10px] text-[var(--foreground)]/40 leading-relaxed">
          Use the workspace to create, preview, and export professional wash care labels.
        </div>
      </div>
    </div>
  );
}
