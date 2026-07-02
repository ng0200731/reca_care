import type { SplitConfiguration, SplitRegion, SplitContentSource } from "./types";

export type SimulatedLabel = {
  labelIndex: number;
  front: SimulatedRegion[];
  back: SimulatedRegion[];
};

export type SimulatedRegion = {
  regionId: string;
  side: "front" | "back";
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  type: "overflow" | "fixed";
  text: string;
  overflowed: boolean;
};

export type SimulationResult = {
  labels: SimulatedLabel[];
  unplacedText: string;
};

function getRegionText(region: SplitRegion, sources: SplitContentSource[]): string {
  if (!region.contentSourceId) return "";
  const source = sources.find((s) => s.id === region.contentSourceId);
  if (!source) return "";
  if (source.type === "manual") return source.manualText ?? "";
  return `[${source.label}]`;
}

function wrapText(
  text: string,
  maxWidth: number,
  maxHeight: number,
  charWidth: number,
  lineHeight: number,
  allowSplit: boolean,
  connectionText: string
): { keep: string; remainder: string; splitAtWord: boolean } {
  const words = text.split(/(\s+)/).filter((w) => w.length > 0);
  const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / charWidth));
  const maxLines = Math.max(1, Math.floor(maxHeight / lineHeight));

  const keepLines: string[] = [];
  let currentLine = "";
  let remainder = "";
  let splitAtWord = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + word;

    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        if (keepLines.length < maxLines) {
          keepLines.push(currentLine.trim());
          currentLine = word;
        } else {
          remainder = words.slice(i).join("");
          break;
        }
      } else {
        // Word itself is too long for line
        if (allowSplit) {
          const spaceLeft = maxCharsPerLine;
          const part = word.slice(0, spaceLeft);
          keepLines.push(part + connectionText);
          currentLine = word.slice(spaceLeft);
          splitAtWord = true;
        } else {
          remainder = words.slice(i).join("");
          break;
        }
      }
    }
  }

  if (currentLine && keepLines.length < maxLines) {
    keepLines.push(currentLine.trim());
    currentLine = "";
  }

  if (currentLine) {
    remainder = currentLine + (remainder ? " " + remainder : "");
  }

  return { keep: keepLines.join("\n"), remainder: remainder.trim(), splitAtWord };
}

export function simulateOverflow(
  config: SplitConfiguration,
  layoutWidthMm: number,
  layoutHeightMm: number,
  padding: { top: number; right: number; bottom: number; left: number }
): SimulationResult {
  const fontSizeMm = config.fontSizeMm || 3;
  const charWidth = fontSizeMm * 0.5;
  const lineHeight = fontSizeMm * 1.4;

  const labels: SimulatedLabel[] = [];

  // Build initial remaining text map
  const remainingByRegion: Record<string, string> = {};
  for (const region of config.regions) {
    remainingByRegion[region.regionId] = getRegionText(region, config.contentSources);
  }

  let safetyCounter = 0;
  const maxLabels = 100;

  while (safetyCounter < maxLabels) {
    safetyCounter++;
    const labelIndex = labels.length;
    const currentLabel: SimulatedLabel = {
      labelIndex,
      front: [],
      back: [],
    };

    let hasOverflow = false;
    let anyContentPlaced = false;

    // Process regions in order (left-to-right, top-to-bottom, front before back)
    const sortedRegions = [...config.regions].sort((a, b) => {
      if (a.side !== b.side) return a.side === "front" ? -1 : 1;
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    for (const region of sortedRegions) {
      const text = remainingByRegion[region.regionId] || "";
      const availableWidth = region.widthMm - padding.left - padding.right;
      const availableHeight = region.heightMm - padding.top - padding.bottom;

      const simulatedRegion: SimulatedRegion = {
        regionId: region.regionId,
        side: region.side,
        x: region.x,
        y: region.y,
        widthMm: region.widthMm,
        heightMm: region.heightMm,
        type: region.type,
        text: "",
        overflowed: false,
      };

      if (region.type === "fixed") {
        simulatedRegion.text = text;
        remainingByRegion[region.regionId] = "";
      } else {
        if (text && availableWidth > 0 && availableHeight > 0) {
          const { keep, remainder } = wrapText(
            text,
            availableWidth,
            availableHeight,
            charWidth,
            lineHeight,
            config.allowSplitText,
            config.connectionText ?? ""
          );
          simulatedRegion.text = keep;
          simulatedRegion.overflowed = remainder.length > 0;
          remainingByRegion[region.regionId] = remainder;

          if (remainder.length > 0) {
            hasOverflow = true;
            if (region.overflowTargetId) {
              const targetText = remainingByRegion[region.overflowTargetId] || "";
              remainingByRegion[region.overflowTargetId] = targetText
                ? targetText + " " + remainder
                : remainder;
              remainingByRegion[region.regionId] = "";
            }
          }
        }
      }

      if (simulatedRegion.text || text) {
        anyContentPlaced = true;
      }

      if (region.side === "front") {
        currentLabel.front.push(simulatedRegion);
      } else {
        currentLabel.back.push(simulatedRegion);
      }
    }

    labels.push(currentLabel);

    // Check if any overflow remains
    const hasRemaining = Object.values(remainingByRegion).some((t) => t.trim().length > 0);
    if (!hasRemaining) break;
    if (!hasOverflow && !anyContentPlaced) break;
  }

  const unplacedText = Object.values(remainingByRegion)
    .filter((t) => t.trim().length > 0)
    .join("\n");

  return { labels, unplacedText };
}

export function applyFixedContentOption(
  result: SimulationResult,
  fixedRegions: SplitRegion[],
  sources: SplitContentSource[],
  option: "tail" | "new-label"
): SimulationResult {
  if (fixedRegions.length === 0) return result;

  const fixedText = fixedRegions
    .map((r) => {
      if (!r.contentSourceId) return "";
      const source = sources.find((s) => s.id === r.contentSourceId);
      if (!source) return "";
      return source.type === "manual" ? source.manualText ?? "" : `[${source.label}]`;
    })
    .filter(Boolean)
    .join(" ");

  if (!fixedText) return result;

  const fixedRegionIds = new Set(fixedRegions.map((r) => r.regionId));

  const labels = result.labels.map((label) => ({
    ...label,
    front: label.front.map((r) => ({ ...r, text: fixedRegionIds.has(r.regionId) ? "" : r.text })),
    back: label.back.map((r) => ({ ...r, text: fixedRegionIds.has(r.regionId) ? "" : r.text })),
  }));

  if (option === "tail") {
    const lastLabel = labels[labels.length - 1];
    const backRegions = lastLabel.back.filter((r) => r.type === "overflow");
    if (backRegions.length > 0) {
      const target = backRegions[backRegions.length - 1];
      target.text = target.text ? target.text + "\n" + fixedText : fixedText;
    }
    return { ...result, labels };
  }

  // new-label: append a label with only fixed content
  const newLabel: SimulatedLabel = {
    labelIndex: labels.length,
    front: fixedRegions
      .filter((r) => r.side === "front")
      .map((r) => ({
        regionId: r.regionId,
        side: r.side,
        x: r.x,
        y: r.y,
        widthMm: r.widthMm,
        heightMm: r.heightMm,
        type: "fixed",
        text: getRegionText(r, sources),
        overflowed: false,
      })),
    back: fixedRegions
      .filter((r) => r.side === "back")
      .map((r) => ({
        regionId: r.regionId,
        side: r.side,
        x: r.x,
        y: r.y,
        widthMm: r.widthMm,
        heightMm: r.heightMm,
        type: "fixed",
        text: getRegionText(r, sources),
        overflowed: false,
      })),
  };

  return { ...result, labels: [...labels, newLabel] };
}
