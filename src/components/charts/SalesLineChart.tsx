import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

type Point = { label: string; value: number };

type Props = {
  data: Point[];
  height?: number; // px
  strokeWidth?: number; // px
  smooth?: boolean; // eğri/Bezier
  showArea?: boolean; // alan dolgusu
  ariaLabel?: string;
};

export default function SalesLineChart({
  data,
  height = 120,
  strokeWidth = 2,
  smooth = true,
  showArea = true,
  ariaLabel = "Satış grafiği",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(300);

  // ResizeObserver ile responsive genişlik
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Grafik padding’leri
  const PAD_X = 8;
  const PAD_Y = 8;

  /**
   * Yukarıdaki useMemo içinde Bezier hesaplamasını net ve typesafe kılmak için
   * ayrı bir blokta tekrar hesaplayalım. (Okunurluk için iki aşamalı tasarım)
   */
  const computed = useMemo(() => {
    if (data.length === 0) {
      return {
        path: "",
        areaPath: "",
        points: [] as { x: number; y: number; label: string; value: number }[],
        minV: 0,
        maxV: 0,
      };
    }

    const values = data.map((d) => d.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = maxV - minV || 1;

    const innerW = Math.max(0, width - PAD_X * 2);
    const innerH = Math.max(0, height - PAD_Y * 2);

    const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

    const pts = data.map((d, i) => {
      const x = PAD_X + i * stepX;
      const y = PAD_Y + innerH - ((d.value - minV) / span) * innerH;
      return { x, y, label: d.label, value: d.value };
    });

    const linePath =
      smooth && pts.length >= 3
        ? getSmoothPath(pts)
        : pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");

    const areaPath = showArea
      ? `${linePath} L ${
          PAD_X + (pts.length > 1 ? (pts.length - 1) * stepX : 0)
        },${PAD_Y + innerH} L ${PAD_X},${PAD_Y + innerH} Z`
      : "";

    return { path: linePath, areaPath, points: pts, minV, maxV };
  }, [data, width, height, smooth, showArea]);

  // Hover tooltip state
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // En yakın noktayı x’e göre bul
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.target as SVGElement)
      .closest("svg")!
      .getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (computed.points.length <= 1) return setHoverIdx(0);
    // ikili arama yerine lineer yeterli (küçük seri)
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < computed.points.length; i++) {
      const d = Math.abs(computed.points[i].x - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHoverIdx(best);
  };

  const onLeave = () => setHoverIdx(null);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height, position: "relative" }}
      aria-label={ariaLabel}
    >
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onMouseMove={onMouseMove}
        onMouseLeave={onLeave}
      >
        {/* Alan dolgusu */}
        {showArea && computed.areaPath && (
          <motion.path
            d={computed.areaPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 0.6 }}
            fill="currentColor"
          />
        )}

        {/* Çizgi */}
        {computed.path && (
          <motion.path
            d={computed.path}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Hover nokta & kılavuz çizgisi */}
        {hoverIdx !== null && computed.points[hoverIdx] && (
          <>
            <line
              x1={computed.points[hoverIdx].x}
              x2={computed.points[hoverIdx].x}
              y1={PAD_Y}
              y2={height - PAD_Y}
              stroke="currentColor"
              opacity={0.2}
            />
            <circle
              cx={computed.points[hoverIdx].x}
              cy={computed.points[hoverIdx].y}
              r={4}
              fill="currentColor"
              stroke="#00000020"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && computed.points[hoverIdx] && (
        <div
          style={{
            position: "absolute",
            left: Math.min(
              Math.max(computed.points[hoverIdx].x - 40, 0),
              width - 80
            ),
            top: Math.max(computed.points[hoverIdx].y - 36, 0),
            pointerEvents: "none",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "6px 8px",
            fontSize: 12,
            borderRadius: 8,
            whiteSpace: "nowrap",
          }}
          aria-hidden="true"
        >
          <div style={{ opacity: 0.8 }}>{data[hoverIdx].label}</div>
          <strong>{formatNumber(data[hoverIdx].value)}</strong>
        </div>
      )}

      {/* Eksen değerlerini göstermek istersen küçük alt yazı */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 8,
          fontSize: 11,
          opacity: 0.6,
          userSelect: "none",
        }}
      >
        Min: {formatNumber(computed.minV)} · Max: {formatNumber(computed.maxV)}
      </div>
    </div>
  );
}

/** Değer formatlayıcı: sayı → 1.234 gibi */
function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n);
  } catch {
    return String(n);
  }
}

/** Cubic Bezier ile pürüzsüz çizgi (Cardinal benzeri) */
function getSmoothPath(
  pts: { x: number; y: number }[],
  smoothing = 0.2
): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0].x},${pts[0].y}`];

  const line = (p0: any, p1: any) => `L ${p1.x},${p1.y}`;
  const controlPoint = (
    current: any,
    previous: any,
    next: any,
    reverse = false
  ) => {
    // "previous" ve "next" için fallback
    const p = previous || current;
    const n = next || current;

    const o = {
      x: (n.x - p.x) * smoothing,
      y: (n.y - p.y) * smoothing,
    };

    return {
      x: current.x + (reverse ? -o.x : o.x),
      y: current.y + (reverse ? -o.y : o.y),
    };
  };

  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const cp1 = controlPoint(p0, pts[i - 2], p1, false);
    const cp2 = controlPoint(p1, p0, pts[i + 1], true);
    d.push(`C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p1.x},${p1.y}`);
  }

  // Çok kısa seri ise düz çizgiye düş
  if (pts.length === 2) {
    return `M ${pts[0].x},${pts[0].y} ${line(pts[0], pts[1])}`;
  }

  return d.join(" ");
}
