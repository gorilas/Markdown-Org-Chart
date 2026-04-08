import { OrgNode as OrgNodeType } from "@/lib/markdownParser";
import { AlignJustify, AlignCenter } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

interface OrgNodeProps {
  node: OrgNodeType;
  onToggleLayout: (id: string) => void;
  isRoot?: boolean;
}

const CONNECTOR = "#c8d6e5";

const CARD_STYLES = [
  { card: "bg-[#00539f] text-white border-[#003e7a]", badge: "text-blue-200", sub: "text-blue-100" },
  { card: "bg-white text-[#212529] border-[#00539f]", badge: "", sub: "text-[#6c757d]" },
  { card: "bg-[#f5f7fa] text-[#333] border-[#c8d6e5]", badge: "", sub: "text-[#6c757d]" },
];

export function OrgNodeComponent({ node, onToggleLayout, isRoot = false }: OrgNodeProps) {
  const hasChildren = node.children.length > 0;
  const isHorizontal = node.layout === "horizontal";
  const style = CARD_STYLES[Math.min(node.level, CARD_STYLES.length - 1)];
  const btnBase = isRoot
    ? "bg-white text-[#00539f] border-white/50 hover:bg-blue-50"
    : "bg-[#00539f] text-white border-[#003e7a] hover:bg-[#003e7a]";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Node card */}
      <div style={{ position: "relative" }} className="group">
        <div
          className={`rounded-sm border-2 px-3 py-2 text-center ${style.card}`}
          style={{
            minWidth: isRoot ? 200 : 150,
            maxWidth: isRoot ? 260 : 220,
            boxShadow: isRoot ? "0 2px 8px rgba(0,83,159,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
            position: "relative",
          }}
        >
          {isRoot && (
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${style.badge}`}>
              Organismo
            </div>
          )}
          <p className={`font-semibold leading-snug break-words ${isRoot ? "text-[14px]" : "text-[12px]"}`}>
            {node.label}
          </p>
          {node.subtitle && (
            <p className={`text-[11px] mt-0.5 leading-tight italic ${style.sub}`}>
              {node.subtitle}
            </p>
          )}
        </div>

        {/* Layout toggle button */}
        {hasChildren && (
          <button
            onClick={() => onToggleLayout(node.id)}
            title={isHorizontal ? "Cambiar a vertical" : "Cambiar a horizontal"}
            className={`
              absolute -top-2.5 -right-2.5 z-20
              w-5 h-5 rounded-full flex items-center justify-center
              border shadow-sm transition-all duration-150
              ${btnBase}
              opacity-0 group-hover:opacity-100 focus:opacity-100
            `}
          >
            {isHorizontal ? <AlignJustify size={9} /> : <AlignCenter size={9} />}
          </button>
        )}
      </div>

      {/* Connector + children */}
      {hasChildren && (
        <>
          {/* Stem down from node */}
          <div style={{ width: 1, height: 16, backgroundColor: CONNECTOR }} />

          {isHorizontal ? (
            <HorizontalGroup children={node.children} onToggleLayout={onToggleLayout} />
          ) : (
            <VerticalGroup children={node.children} onToggleLayout={onToggleLayout} />
          )}
        </>
      )}
    </div>
  );
}

function HorizontalGroup({
  children,
  onToggleLayout,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
}) {
  const count = children.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      {/* Horizontal bar at the top */}
      {count > 1 && (
        <div style={{ display: "flex", height: 0, position: "relative", marginBottom: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "calc(50% / " + count + ")",
              right: "calc(50% / " + count + ")",
              height: 1,
              backgroundColor: CONNECTOR,
            }}
          />
        </div>
      )}

      {/* Children row */}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
        {children.map((child, index) => (
          <div
            key={child.id}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 10px" }}
          >
            {/* Tick from horizontal bar down to child */}
            <div style={{ width: 1, height: 16, backgroundColor: CONNECTOR }} />
            <OrgNodeComponent node={child} onToggleLayout={onToggleLayout} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalGroup({
  children,
  onToggleLayout,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const spine = spineRef.current;
    if (!container || !spine) return;

    const rows = container.querySelectorAll<HTMLElement>(":scope > [data-vertical-row]");
    if (rows.length === 0) return;

    const parentRect = container.getBoundingClientRect();
    const firstRect = rows[0].getBoundingClientRect();
    const lastRect = rows[rows.length - 1].getBoundingClientRect();

    const topOffset = firstRect.top + firstRect.height / 2 - parentRect.top;
    const bottomOffset = lastRect.top + lastRect.height / 2 - parentRect.top;

    spine.style.top = `${topOffset}px`;
    spine.style.bottom = `${parentRect.height - bottomOffset}px`;
  }, [children]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {/* Vertical spine: runs from center of first child to center of last child */}
      <div
        ref={spineRef}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          bottom: "50%",
          width: 1,
          backgroundColor: CONNECTOR,
        }}
      />
      {children.map((child) => (
        <div
          key={child.id}
          data-vertical-row
          style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        >
          <div style={{ width: 24, height: 1, backgroundColor: CONNECTOR, flexShrink: 0 }} />
          <div style={{ padding: "4px 0" }}>
            <OrgNodeComponent node={child} onToggleLayout={onToggleLayout} />
          </div>
        </div>
      ))}
    </div>
  );
}
