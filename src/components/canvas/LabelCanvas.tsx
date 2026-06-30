"use client";

import { useMemo } from "react";

type Props = {
  widthMm: number;
  heightMm: number;
  orientation: "portrait" | "landscape";
  maxDisplayPx: number;
  foldOrientation?: "vertical" | "horizontal";
  foldDistanceMm?: number;
  foldMidForm?: boolean;
  showFold?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
  paddingRegion2?: { top: number; right: number; bottom: number; left: number };
  showPadding?: boolean;
  showDimensions?: boolean;
  isFront?: boolean;
  flipped?: boolean;
  onFlipToggle?: () => void;
  showFlipButton?: boolean;
};

export default function LabelCanvas({
  widthMm,
  heightMm,
  orientation,
  maxDisplayPx,
  foldOrientation,
  foldDistanceMm,
  foldMidForm = false,
  showFold = false,
  padding,
  paddingRegion2,
  showPadding = false,
  showDimensions = false,
  isFront = true,
  flipped = false,
  onFlipToggle,
  showFlipButton = false,
}: Props) {
  const canvas = useMemo(() => {
    const w = orientation === "portrait" ? widthMm : heightMm;
    const h = orientation === "portrait" ? heightMm : widthMm;

    const scale = Math.min(maxDisplayPx / w, maxDisplayPx / h, 4);
    const cw = w * scale;
    const ch = h * scale;

  const foldX =
    showFold && foldOrientation === "vertical"
      ? (foldMidForm ? w / 2 : foldDistanceMm ?? w / 2) * scale
      : null;
  const foldY =
    showFold && foldOrientation === "horizontal"
      ? (foldMidForm ? h / 2 : foldDistanceMm ?? h / 2) * scale
      : null;

    return { w, h, scale, cw, ch, foldX, foldY };
  }, [widthMm, heightMm, orientation, maxDisplayPx, showFold, foldOrientation, foldDistanceMm, foldMidForm]);

  const btnSize = 5 * canvas.scale;
  const btnX = canvas.cw - btnSize - 0.75 * canvas.scale;
  const btnY = 0.75 * canvas.scale;

  const dimMargin = showDimensions ? 5 * canvas.scale : 0;
  const vbW = canvas.cw + 2 + dimMargin;
  const vbH = canvas.ch + 2 + dimMargin;

  return (
    <svg
      width={canvas.cw}
      height={canvas.ch}
      viewBox={`-1 -1 ${vbW} ${vbH}`}
      className="bg-white shadow-[var(--shadow-md)] border border-[var(--border)] rounded-sm"
    >
      <g transform={flipped ? `rotate(180, ${canvas.cw / 2}, ${canvas.ch / 2})` : undefined}>
        <rect x="0" y="0" width={canvas.cw} height={canvas.ch} fill="white" stroke="#0F172A" strokeWidth={1} />

        {isFront && (
          <>
            <text
              x={canvas.cw / 2}
              y={canvas.ch / 2 - 8 * canvas.scale}
              textAnchor="middle"
              fontSize={4 * canvas.scale}
              fill="#0F172A"
              fontWeight={500}
            >
              CARE LABEL
            </text>
            <text
              x={canvas.cw / 2}
              y={canvas.ch / 2 + 4 * canvas.scale}
              textAnchor="middle"
              fontSize={2.5 * canvas.scale}
              fill="#64748B"
            >
              FRONT SIDE
            </text>
          </>
        )}

        {!isFront && (
          <text
            x={canvas.cw / 2}
            y={canvas.ch / 2}
            textAnchor="middle"
            fontSize={4 * canvas.scale}
            fill="#0F172A"
            fontWeight={500}
          >
            BACK SIDE
          </text>
        )}

        {showFold && canvas.foldX != null && (
          <line
            x1={canvas.foldX}
            y1={0}
            x2={canvas.foldX}
            y2={canvas.ch}
            stroke="#DC2626"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}
        {showFold && canvas.foldY != null && (
          <line
            x1={0}
            y1={canvas.foldY}
            x2={canvas.cw}
            y2={canvas.foldY}
            stroke="#DC2626"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
        )}

        {showPadding && padding && (() => {
          const drawPad = (
            pad: { top: number; right: number; bottom: number; left: number },
            offsetX: number = 0,
            offsetY: number = 0,
            regionW: number = canvas.cw,
            regionH: number = canvas.ch
          ) => {
            if (pad.top + pad.bottom >= regionH / canvas.scale || pad.left + pad.right >= regionW / canvas.scale) return null;
            const x = offsetX + pad.left * canvas.scale;
            const y = offsetY + pad.top * canvas.scale;
            const w = regionW - (pad.left + pad.right) * canvas.scale;
            const h = regionH - (pad.top + pad.bottom) * canvas.scale;
            return (
              <rect
                x={x}
                y={y}
                width={Math.max(0, w)}
                height={Math.max(0, h)}
                fill="none"
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            );
          };

          if (canvas.foldX != null && canvas.foldY == null) {
            const r2Pad = paddingRegion2 || { top: 0, right: 0, bottom: 0, left: 0 };
            return (
              <g>
                {drawPad(padding, 0, 0, canvas.foldX, canvas.ch)}
                {drawPad(r2Pad, canvas.foldX, 0, canvas.cw - canvas.foldX, canvas.ch)}
              </g>
            );
          } else if (canvas.foldY != null && canvas.foldX == null) {
            const r2Pad = paddingRegion2 || { top: 0, right: 0, bottom: 0, left: 0 };
            return (
              <g>
                {drawPad(padding, 0, 0, canvas.cw, canvas.foldY)}
                {drawPad(r2Pad, 0, canvas.foldY, canvas.cw, canvas.ch - canvas.foldY)}
              </g>
            );
          }
          return drawPad(padding);
        })()}

        {showDimensions && (
          <>
            <text
              x={canvas.cw / 2}
              y={canvas.ch + 3.5 * canvas.scale}
              textAnchor="middle"
              fontSize={2 * canvas.scale}
              fill="#0F172A"
              fontWeight={500}
            >
              {canvas.w.toFixed(0)} mm
            </text>
            <text
              x={canvas.cw + 3.5 * canvas.scale}
              y={canvas.ch / 2}
              textAnchor="middle"
              fontSize={2 * canvas.scale}
              fill="#0F172A"
              fontWeight={500}
              transform={`rotate(90,${canvas.cw + 3.5 * canvas.scale},${canvas.ch / 2})`}
            >
              {canvas.h.toFixed(0)} mm
            </text>
          </>
        )}
      </g>

      {showFlipButton && onFlipToggle && (
        <g
          onClick={onFlipToggle}
          style={{ cursor: "pointer" }}
          transform={`translate(${btnX}, ${btnY})`}
        >
          <rect
            x={0}
            y={0}
            width={btnSize}
            height={btnSize}
            rx={1 * canvas.scale}
            fill={flipped ? "var(--primary)" : "#F1F5F9"}
            stroke="#CBD5E1"
            strokeWidth={0.5 * canvas.scale}
          />
          <path
            d={`M ${btnSize * 0.22} ${btnSize * 0.5} A ${btnSize * 0.18} ${btnSize * 0.18} 0 1 1 ${btnSize * 0.78} ${btnSize * 0.5}`}
            fill="none"
            stroke={flipped ? "white" : "#475569"}
            strokeWidth={0.65 * canvas.scale}
            strokeLinecap="round"
          />
          <path
            d={`M ${btnSize * 0.78} ${btnSize * 0.42} L ${btnSize * 0.78} ${btnSize * 0.5} L ${btnSize * 0.68} ${btnSize * 0.5}`}
            fill="none"
            stroke={flipped ? "white" : "#475569"}
            strokeWidth={0.65 * canvas.scale}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
}
