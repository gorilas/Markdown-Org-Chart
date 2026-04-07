import { useRef, useState } from "react";
import { OrgNode } from "@/lib/markdownParser";
import { OrgNodeComponent } from "./OrgNode";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface OrgChartProps {
  root: OrgNode;
  onToggleLayout: (id: string) => void;
}

export function OrgChart({ root, onToggleLayout }: OrgChartProps) {
  const [scale, setScale] = useState(0.85);

  const zoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const resetZoom = () => setScale(0.85);

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
          onClick={resetZoom}
          title="Restablecer zoom"
          className="w-7 h-7 flex items-center justify-center text-[#333] hover:bg-[#f5f7fa] rounded-sm transition-colors"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Scrollable canvas */}
      <div className="flex-1 overflow-auto">
        <div
          style={{
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 80px 60px",
          }}
        >
          <div
            id="orgchart-canvas"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
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
