import { useRef, useState, useEffect, useCallback } from "react";
import { OrgNode } from "@/lib/markdownParser";
import { OrgNodeComponent } from "./OrgNode";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface OrgChartProps {
  root: OrgNode;
  onToggleLayout: (id: string) => void;
}

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;
const ZOOM_PADDING = 0.95; // 5 % breathing room when fitting

export function OrgChart({ root, onToggleLayout }: OrgChartProps) {
  const [scale, setScale] = useState(0.85);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  // Track whether the user has manually overridden the auto-fit zoom
  const userZoomedRef = useRef(false);

  const computeFitScale = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return null;
    // offsetWidth/offsetHeight give the layout size at zoom:1
    // We must temporarily reset zoom to 1 so the measurement is unaffected
    const prevZoom = canvas.style.zoom;
    canvas.style.zoom = "1";
    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    canvas.style.zoom = prevZoom;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (!cw || !ch) return null;
    const fit = Math.min(containerW / cw, containerH / ch) * ZOOM_PADDING;
    return Math.min(Math.max(fit, ZOOM_MIN), ZOOM_MAX);
  }, []);

  const fitToScreen = useCallback(() => {
    const s = computeFitScale();
    if (s !== null) {
      userZoomedRef.current = false;
      setScale(s);
    }
  }, [computeFitScale]);

  // Auto-fit on first render and whenever the chart content changes
  useEffect(() => {
    if (userZoomedRef.current) return;
    // Small delay so the DOM has painted the new tree
    const id = requestAnimationFrame(() => {
      const s = computeFitScale();
      if (s !== null) setScale(s);
    });
    return () => cancelAnimationFrame(id);
  }, [root, computeFitScale]);

  // Re-fit on container resize (window resize, sidebar open/close)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      if (userZoomedRef.current) return;
      const s = computeFitScale();
      if (s !== null) setScale(s);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [computeFitScale]);

  const zoomIn = () => {
    userZoomedRef.current = true;
    setScale((s) => Math.min(+(s + ZOOM_STEP).toFixed(2), ZOOM_MAX));
  };

  const zoomOut = () => {
    userZoomedRef.current = true;
    setScale((s) => Math.max(+(s - ZOOM_STEP).toFixed(2), ZOOM_MIN));
  };

  return (
    <div className="relative flex flex-col h-full bg-[#f0f2f5]">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white rounded-sm border border-[#dee2e6] shadow-sm p-1">
        <button
          onClick={zoomIn}
          title="Acercar"
          className="w-7 h-7 flex items-center justify-center text-[#333] hover:bg-[#f5f7fa] rounded-sm transition-colors"
        >
          <ZoomIn size={14} />
        </button>
        <div className="text-[10px] text-center text-[#6c757d] font-mono py-0.5 leading-none">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={zoomOut}
          title="Alejar"
          className="w-7 h-7 flex items-center justify-center text-[#333] hover:bg-[#f5f7fa] rounded-sm transition-colors"
        >
          <ZoomOut size={14} />
        </button>
        <div className="border-t border-[#dee2e6] my-0.5" />
        <button
          onClick={fitToScreen}
          title="Ajustar a pantalla"
          className="w-7 h-7 flex items-center justify-center text-[#333] hover:bg-[#f5f7fa] rounded-sm transition-colors"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      {/* Scrollable canvas — overflow-auto works correctly with CSS zoom */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div
          style={{
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 80px 60px",
            boxSizing: "border-box",
          }}
        >
          {/*
           * CSS zoom (not transform:scale) is used here so that the element's
           * layout box shrinks/grows with the zoom value. The scroll container
           * therefore always reflects the true visual size and every node is
           * reachable by scrolling, even at high zoom levels.
           */}
          <div
            ref={canvasRef}
            id="orgchart-canvas"
            style={{
              zoom: scale,
              backgroundColor: "#fff",
              padding: "40px 60px 60px",
              borderRadius: "4px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "inline-block",
            }}
          >
            <OrgNodeComponent node={root} onToggleLayout={onToggleLayout} isRoot />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-[#dee2e6] px-4 py-2 flex flex-wrap items-center gap-4 text-xs text-[#6c757d] bg-white flex-shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#00539f]" />
          Organismo principal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-white border-2 border-[#00539f]" />
          Unidades / Direcciones
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#f5f7fa] border border-[#dee2e6]" />
          Servicios
        </span>
        <span className="ml-auto hidden sm:inline">Pasa el ratón sobre un nodo con hijos para cambiar su disposición (H/V)</span>
      </div>
    </div>
  );
}
