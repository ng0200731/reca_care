import { jsPDF } from "jspdf";

export type PaddingValues = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function mmToPixels(mm: number, dpi: number = 96): number {
  return (mm * dpi) / 25.4;
}

export function pixelsToMm(pixels: number, dpi: number = 96): number {
  return (pixels * 25.4) / dpi;
}

export function getDisplayedDimensions(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape"
): { w: number; h: number } {
  return {
    w: orientation === "portrait" ? widthMm : heightMm,
    h: orientation === "portrait" ? heightMm : widthMm,
  };
}

function getFoldDistance(
  foldOrientation: "vertical" | "horizontal",
  w: number,
  h: number,
  foldDistanceMm: number | undefined,
  foldMidForm: boolean
): number {
  if (foldMidForm) {
    return foldOrientation === "vertical" ? w / 2 : h / 2;
  }
  return foldDistanceMm ?? (foldOrientation === "vertical" ? w / 2 : h / 2);
}

export function generateSvgLabel(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape",
  foldOrientation?: "vertical" | "horizontal",
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues,
  showPadding: boolean = false,
  showFold: boolean = false,
  showDimensions: boolean = false,
  foldMidForm: boolean = false
): string {
  const { w, h } = getDisplayedDimensions(widthMm, heightMm, orientation);

  const parts: string[] = [];

  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">`);

  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="white" stroke="black" stroke-width="0.3"/>`);

  if (showFold && foldOrientation) {
    const distance = getFoldDistance(foldOrientation, w, h, foldDistanceMm, foldMidForm);
    if (foldOrientation === "vertical") {
      const y2 = foldMidForm ? h / 2 : h;
      parts.push(`<line x1="${distance}" y1="0" x2="${distance}" y2="${y2}" stroke="#DC2626" stroke-width="0.3" stroke-dasharray="2,2"/>`);
    } else {
      const x2 = foldMidForm ? w / 2 : w;
      parts.push(`<line x1="0" y1="${distance}" x2="${x2}" y2="${distance}" stroke="#DC2626" stroke-width="0.3" stroke-dasharray="2,2"/>`);
    }
  }

  if (showPadding && padding) {
    const drawPad = (pad: PaddingValues, offsetX: number = 0, offsetY: number = 0, regionW: number = w, regionH: number = h) => {
      if (pad.top + pad.bottom >= regionH || pad.left + pad.right >= regionW) return;
      parts.push(`<rect x="${offsetX + pad.left}" y="${offsetY + pad.top}" width="${regionW - pad.left - pad.right}" height="${regionH - pad.top - pad.bottom}" fill="none" stroke="#22c55e" stroke-width="0.3" stroke-dasharray="2,2"/>`);
    };

    if (foldOrientation) {
      const distance = getFoldDistance(foldOrientation, w, h, foldDistanceMm, foldMidForm);
      const r2Pad = paddingRegion2 || { top: 0, right: 0, bottom: 0, left: 0 };
      if (foldOrientation === "vertical") {
        drawPad(padding, 0, 0, distance, h);
        drawPad(r2Pad, distance, 0, w - distance, h);
      } else {
        drawPad(padding, 0, 0, w, distance);
        drawPad(r2Pad, 0, distance, w, h - distance);
      }
    } else {
      drawPad(padding);
    }
  }

  if (showDimensions) {
    const fontSize = 2.5;
    parts.push(`<text x="${w / 2}" y="${h + 3}" text-anchor="middle" font-size="${fontSize}" fill="#333">${w.toFixed(0)} mm</text>`);
    parts.push(`<text x="${w + 3}" y="${h / 2}" text-anchor="middle" font-size="${fontSize}" fill="#333" transform="rotate(90,${w + 3},${h / 2})">${h.toFixed(0)} mm</text>`);
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

export function generatePdfLabel(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape",
  foldOrientation?: "vertical" | "horizontal",
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues,
  showPadding: boolean = false,
  showFold: boolean = false,
  foldMidForm: boolean = false
): ArrayBuffer {
  const { w, h } = getDisplayedDimensions(widthMm, heightMm, orientation);

  const doc = new jsPDF({
    orientation: w > h ? "landscape" : "portrait",
    unit: "mm",
    format: [w, h],
  });

  drawLabelOnPdf(doc, 0, 0, w, h, foldOrientation, foldDistanceMm, padding, paddingRegion2, showPadding, showFold, foldMidForm);

  return doc.output("arraybuffer") as ArrayBuffer;
}

function drawLabelOnPdf(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  foldOrientation?: "vertical" | "horizontal",
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues,
  showPadding: boolean = false,
  showFold: boolean = false,
  foldMidForm: boolean = false
) {
  // Label outline
  doc.setDrawColor(0);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([], 0);
  doc.rect(x, y, w, h, "FD");

  // Fold line
  if (showFold && foldOrientation) {
    const distance = getFoldDistance(foldOrientation, w, h, foldDistanceMm, foldMidForm);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);

    if (foldOrientation === "vertical") {
      const y2 = foldMidForm ? h / 2 : h;
      doc.line(x + distance, y, x + distance, y + y2);
    } else {
      const x2 = foldMidForm ? w / 2 : w;
      doc.line(x, y + distance, x + x2, y + distance);
    }

    doc.setLineDashPattern([], 0);
  }

  // Padding rectangles
  if (showPadding && padding) {
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);

    const drawPad = (pad: PaddingValues, offsetX: number = 0, offsetY: number = 0, regionW: number = w, regionH: number = h) => {
      if (pad.top + pad.bottom >= regionH || pad.left + pad.right >= regionW) return;
      doc.rect(x + offsetX + pad.left, y + offsetY + pad.top, regionW - pad.left - pad.right, regionH - pad.top - pad.bottom, "S");
    };

    if (foldOrientation) {
      const distance = getFoldDistance(foldOrientation, w, h, foldDistanceMm, foldMidForm);
      const r2Pad = paddingRegion2 || { top: 0, right: 0, bottom: 0, left: 0 };
      if (foldOrientation === "vertical") {
        drawPad(padding, 0, 0, distance, h);
        drawPad(r2Pad, distance, 0, w - distance, h);
      } else {
        drawPad(padding, 0, 0, w, distance);
        drawPad(r2Pad, 0, distance, w, h - distance);
      }
    } else {
      drawPad(padding);
    }

    doc.setLineDashPattern([], 0);
  }
}

export function generateCombinedPdfLabel(
  widthMm: number,
  heightMm: number,
  orientation: "portrait" | "landscape",
  foldOrientation?: "vertical" | "horizontal",
  foldDistanceMm?: number,
  padding?: PaddingValues,
  paddingRegion2?: PaddingValues,
  showPadding: boolean = false,
  showFold: boolean = false,
  foldMidForm: boolean = false
): ArrayBuffer {
  const { w, h } = getDisplayedDimensions(widthMm, heightMm, orientation);
  const gap = 10;
  const pageW = w * 2 + gap;
  const pageH = h;

  const doc = new jsPDF({
    orientation: pageW > pageH ? "landscape" : "portrait",
    unit: "mm",
    format: [pageW, pageH],
  });

  drawLabelOnPdf(doc, 0, 0, w, h, foldOrientation, foldDistanceMm, padding, paddingRegion2, showPadding, showFold, foldMidForm);
  drawLabelOnPdf(doc, w + gap, 0, w, h, foldOrientation, foldDistanceMm, padding, paddingRegion2, showPadding, showFold, foldMidForm);

  return doc.output("arraybuffer") as ArrayBuffer;
}
