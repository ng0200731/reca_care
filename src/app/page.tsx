"use client";

import { useEffect, useCallback, useState } from "react";
import LeftMenu from "@/components/LeftMenu";
import StepRenderer from "@/components/StepRenderer";
import { useLayoutStore } from "@/store/layoutStore";

function generateSvgString(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape",
  isFront: boolean,
  foldOrientation?: string,
  foldDistanceMm?: number
): string {
  const w = orientation === "portrait" ? widthMm : heightMm;
  const h = orientation === "portrait" ? heightMm : widthMm;

  const label = isFront
    ? `<text x="${w / 2}" y="${h / 2 - 4}" text-anchor="middle" font-size="4" fill="#333">CARE LABEL</text>
<text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle" font-size="3" fill="#666">FRONT SIDE</text>`
    : `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-size="4" fill="#333">BACK SIDE</text>`;

  let foldLine = "";
  if (foldOrientation === "vertical" && foldDistanceMm != null) {
    foldLine = `<line x1="${foldDistanceMm}" y1="0" x2="${foldDistanceMm}" y2="${h}" stroke="#DC2626" stroke-width="0.3" stroke-dasharray="2,2"/>`;
  } else if (foldOrientation === "horizontal" && foldDistanceMm != null) {
    foldLine = `<line x1="0" y1="${foldDistanceMm}" x2="${w}" y2="${foldDistanceMm}" stroke="#DC2626" stroke-width="0.3" stroke-dasharray="2,2"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">
  <rect x="0" y="0" width="${w}" height="${h}" fill="white" stroke="black" stroke-width="0.3"/>
  ${label}
  ${foldLine}
</svg>`;
}

type PaddingValues = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

function drawEpsPadding(
  w: number,
  h: number,
  pad: PaddingValues,
  offsetX: number,
  offsetY: number,
  regionW: number,
  regionH: number
): string {
  if (pad.top + pad.bottom >= regionH || pad.left + pad.right >= regionW) return "";
  const x = offsetX + pad.left;
  const y = offsetY + pad.bottom;
  const rw = regionW - pad.left - pad.right;
  const rh = regionH - pad.top - pad.bottom;
  return `% Padding rectangle
0.1333 0.7725 0.3686 setrgbcolor
0.3 setlinewidth
[2 2] 0 setdash
newpath ${x} ${y} moveto ${x + rw} ${y} lineto ${x + rw} ${y + rh} lineto ${x} ${y + rh} lineto closepath stroke
[] 0 setdash
`;
}

function generateEpsPanel(
  w: number,
  h: number,
  isFront: boolean,
  foldOrientation?: string,
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues
): string {
  const centerText = (x: number, y: number, text: string, size: number) =>
    `/Helvetica findfont ${size} scalefont setfont\n${x} ${y} moveto\n(${text}) dup stringwidth pop 2 div neg 0 rmoveto\nshow`;

  let body = `% Label outline
0 0 0 setrgbcolor
0.3 setlinewidth
newpath 0 0 moveto ${w} 0 lineto ${w} ${h} lineto 0 ${h} lineto closepath stroke
`;

  if (isFront) {
    body += `% Front text
0 0 0 setrgbcolor
${centerText(w / 2, h / 2 + 4, "CARE LABEL", 4)}
${centerText(w / 2, h / 2 - 4, "FRONT SIDE", 3)}
`;
  } else {
    body += `% Back text
0 0 0 setrgbcolor
${centerText(w / 2, h / 2, "BACK SIDE", 4)}
`;
  }

  if (foldOrientation === "vertical" && foldDistanceMm != null) {
    body += `% Vertical fold line
1 0 0 setrgbcolor
0.3 setlinewidth
[2 2] 0 setdash
newpath ${foldDistanceMm} 0 moveto ${foldDistanceMm} ${h} lineto stroke
[] 0 setdash
`;
    if (padding) {
      body += drawEpsPadding(w, h, padding, 0, 0, foldDistanceMm, h);
      const r2Pad = paddingRegion2 ?? { top: 0, right: 0, bottom: 0, left: 0 };
      body += drawEpsPadding(w, h, r2Pad, foldDistanceMm, 0, w - foldDistanceMm, h);
    }
  } else if (foldOrientation === "horizontal" && foldDistanceMm != null) {
    body += `% Horizontal fold line
1 0 0 setrgbcolor
0.3 setlinewidth
[2 2] 0 setdash
newpath 0 ${foldDistanceMm} moveto ${w} ${foldDistanceMm} lineto stroke
[] 0 setdash
`;
    if (padding) {
      body += drawEpsPadding(w, h, padding, 0, 0, w, foldDistanceMm);
      const r2Pad = paddingRegion2 ?? { top: 0, right: 0, bottom: 0, left: 0 };
      body += drawEpsPadding(w, h, r2Pad, 0, foldDistanceMm, w, h - foldDistanceMm);
    }
  } else if (padding) {
    body += drawEpsPadding(w, h, padding, 0, 0, w, h);
  }

  return body;
}

function generateCombinedEpsString(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape",
  foldOrientation?: string,
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues
): string {
  const w = orientation === "portrait" ? widthMm : heightMm;
  const h = orientation === "portrait" ? heightMm : widthMm;
  const gapMm = 10;
  const totalW = w * 2 + gapMm;
  const mmToPt = 72 / 25.4;
  const pw = totalW * mmToPt;
  const ph = h * mmToPt;

  const frontPanel = generateEpsPanel(w, h, true, foldOrientation, foldDistanceMm, padding, paddingRegion2);
  const backPanel = generateEpsPanel(w, h, false, foldOrientation, foldDistanceMm, padding, paddingRegion2);

  return `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${Math.ceil(pw)} ${Math.ceil(ph)}
%%HiResBoundingBox: 0 0 ${pw.toFixed(4)} ${ph.toFixed(4)}
%%Creator: WashCare Label Designer
%%EndComments
%%BeginProlog
%%EndProlog
%%Page: 1 1
gsave
72 25.4 div 72 25.4 div scale
% Front panel
${frontPanel}% Back panel
${w + gapMm} 0 translate
${backPanel}grestore
showpage
%%EOF`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const viewPanel = useLayoutStore((s) => s.viewPanel);
  const data = useLayoutStore((s) => s.data);
  const isDirty = useLayoutStore((s) => s.isDirty);
  const savedLayouts = useLayoutStore((s) => s.savedLayouts);
  const setSavedLayouts = useLayoutStore((s) => s.setSavedLayouts);
  const loadLayout = useLayoutStore((s) => s.loadLayout);
  const markClean = useLayoutStore((s) => s.markClean);
  const setStep = useLayoutStore((s) => s.setStep);
  const setViewPanel = useLayoutStore((s) => s.setViewPanel);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchLayouts = useCallback(async () => {
    try {
      const r = await fetch("/api/layouts");
      const list = await r.json();
      setSavedLayouts(list);
    } catch {}
  }, [setSavedLayouts]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  const handleLoad = useCallback(
    async (id: string) => {
      setLoading(true);
      setLoadError("");
      try {
        const r = await fetch(`/api/layouts/${id}`);
        if (!r.ok) throw new Error("Not found");
        const layout = await r.json();
        const d = layout.details;
        if (!d) {
          setLoadError("Layout has no details");
          return;
        }
        loadLayout({
          id: layout.id,
          name: layout.name,
          materialId: d.materialId,
          widthMm: d.widthMm,
          heightMm: d.heightMm,
          orientation: d.orientation,
          cuttingType: d.cuttingType,
          loopFoldOrientation: d.loopFoldOrientation ?? undefined,
          loopMidForm: d.loopMidForm ?? undefined,
          loopFoldDistanceMm: d.loopFoldDistanceMm ?? undefined,
          paddingOption: d.paddingOption,
          padding: {
            top: d.paddingTop,
            right: d.paddingRight,
            bottom: d.paddingBottom,
            left: d.paddingLeft,
          },
          paddingRegion2: {
            top: d.paddingR2Top,
            right: d.paddingR2Right,
            bottom: d.paddingR2Bottom,
            left: d.paddingR2Left,
          },
          paddingSyncRegions: d.paddingSyncRegions ?? undefined,
          viewMode: d.viewMode,
        });
        setStep("final");
        setViewPanel("layout-create");
      } catch {
        setLoadError("Failed to load layout");
      } finally {
        setLoading(false);
      }
    },
    [loadLayout, setStep, setViewPanel]
  );

  const handleSave = useCallback(async () => {
    const name = data.name.trim() || prompt("Enter layout name:");
    if (!name) return;

    const payload = { ...data, name };
    const res = await fetch("/api/layouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      markClean();
      const saved = await res.json();
      const current = useLayoutStore.getState().savedLayouts;
      setSavedLayouts([...current, { id: saved.id, name: saved.name }]);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save layout");
    }
  }, [data, markClean, setSavedLayouts]);

  const handleExport = useCallback(
    async (format: "svg" | "ai" | "pdf") => {
      const baseName = data.name || "care-label";
      const svgFront = generateSvgString(
        data.widthMm,
        data.heightMm,
        data.orientation,
        true,
        data.loopFoldOrientation,
        data.loopMidForm && data.loopFoldOrientation
          ? Math.round(
              (data.loopFoldOrientation === "vertical" ? data.widthMm : data.heightMm) / 2
            )
          : data.loopFoldDistanceMm
      );

      if (format === "svg") {
        downloadBlob(svgFront, `${baseName}.svg`, "image/svg+xml");
      } else if (format === "ai") {
        const foldDistance =
          data.loopMidForm && data.loopFoldOrientation
            ? Math.round(
                (data.loopFoldOrientation === "vertical" ? data.widthMm : data.heightMm) / 2
              )
            : data.loopFoldDistanceMm;
        const epsBoth = generateCombinedEpsString(
          data.widthMm,
          data.heightMm,
          data.orientation,
          data.loopFoldOrientation,
          foldDistance,
          data.padding,
          data.paddingRegion2
        );
        downloadBlob(epsBoth, `${baseName}.ai`, "application/postscript");
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const w = data.orientation === "portrait" ? data.widthMm : data.heightMm;
        const h = data.orientation === "portrait" ? data.heightMm : data.widthMm;
        const doc = new jsPDF({
          orientation: w > h ? "landscape" : "portrait",
          unit: "mm",
          format: [w, h],
        });
        const svgBlob = new Blob([svgFront], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            doc.addImage(img, "PNG", 0, 0, w, h);
            doc.save(`${baseName}.pdf`);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });
      }
    },
    [data]
  );

  return (
    <div className="h-full flex bg-[var(--background)]">
      {/* Desktop sidebar */}
      <aside className="w-[280px] lg:w-[320px] h-full flex-shrink-0 hidden md:flex shadow-[var(--shadow-sm)]">
        <LeftMenu onNavigate={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] h-full bg-white shadow-[var(--shadow-lg)] transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <LeftMenu onNavigate={() => setMobileMenuOpen(false)} />
      </aside>

      <main className="flex-1 h-full overflow-y-auto">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[var(--border)] sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors duration-200 cursor-pointer"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold text-[var(--foreground)]">WashCare Label</h1>
            <p className="text-[10px] text-[var(--foreground)]/50">Design Studio</p>
          </div>
        </header>
        {viewPanel === "layout-create" ? (
          <div className="max-w-3xl mx-auto p-6 lg:p-10">
            <StepRenderer />

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-sm)]">
              <input
                type="text"
                placeholder="Layout name..."
                value={data.name}
                onChange={(e) =>
                  useLayoutStore.getState().setLayoutName(e.target.value)
                }
                className="flex-1 px-3.5 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all duration-200"
              />
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary)]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer shrink-0"
              >
                Save Layout
              </button>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleExport("svg")}
                  className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--accent)]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  SVG
                </button>
                <button
                  onClick={() => handleExport("ai")}
                  className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--secondary)]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  AI
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="px-4 py-2 bg-[var(--destructive)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--destructive)]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  PDF
                </button>
              </div>
              {isDirty && (
                <span className="text-xs text-[var(--accent)] font-medium shrink-0">Unsaved changes</span>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-6 lg:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Saved Layouts</h2>
              <p className="text-sm text-[var(--foreground)]/50 mt-1">
                Select a layout to load and edit
              </p>
            </div>

            {loadError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-[var(--destructive)]">
                {loadError}
              </div>
            )}

            {savedLayouts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[var(--border)] rounded-xl">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)]/40">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-[var(--foreground)]">No saved layouts yet</p>
                <p className="text-sm text-[var(--foreground)]/50 mt-1">
                  Create a layout first, then come here to load it
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLayouts.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-4 bg-white border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-md)] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">
                        {l.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleLoad(l.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 cursor-pointer shrink-0"
                    >
                      {loading ? "Loading..." : "Open"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={fetchLayouts}
              className="mt-4 px-4 py-2 text-xs font-medium text-[var(--foreground)]/60 hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)]/30 rounded-lg transition-all duration-200 cursor-pointer"
            >
              Refresh list
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
