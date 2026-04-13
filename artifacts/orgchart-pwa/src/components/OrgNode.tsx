import { OrgNode as OrgNodeType } from "@/lib/markdownParser";
import { AlignJustify, AlignCenter } from "lucide-react";

interface OrgNodeProps {
  node: OrgNodeType;
  onToggleLayout: (id: string) => void;
  isRoot?: boolean;
}

const CONNECTOR = "#aac0d8";

const CARD_STYLES = [
  {
    card: "bg-[#dbeeff] text-[#003e7a] border-[#00539f]",
    badge: "text-[#00539f]",
    sub: "text-[#4a6fa5]",
  },
  {
    card: "bg-white text-[#212529] border-[#00539f]",
    badge: "",
    sub: "text-[#6c757d]",
  },
  {
    card: "bg-[#f5f7fa] text-[#333] border-[#c8d6e5]",
    badge: "",
    sub: "text-[#6c757d]",
  },
];

const TOGGLE_BTN =
  "bg-[#00539f] text-white border-[#003e7a] hover:bg-[#003e7a]";

export function OrgNodeComponent({
  node,
  onToggleLayout,
  isRoot = false,
}: OrgNodeProps) {
  const hasChildren = node.children.length > 0;
  const isHorizontal = node.layout === "horizontal";
  const style = CARD_STYLES[Math.min(node.level, CARD_STYLES.length - 1)];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Node card */}
      <div style={{ position: "relative" }} className="group">
        <div
          className={`rounded-sm border-2 px-3 py-2 text-center ${style.card}`}
          style={{
            minWidth: isRoot ? 200 : 150,
            maxWidth: isRoot ? 280 : 230,
            boxShadow: isRoot
              ? "0 2px 8px rgba(0,83,159,0.18)"
              : "0 1px 3px rgba(0,0,0,0.07)",
          }}
        >
          {isRoot && (
            <div
              className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${style.badge}`}
            >
              Organismo
            </div>
          )}
          <p
            className={`font-semibold leading-snug break-words ${isRoot ? "text-[14px]" : "text-[12px]"}`}
          >
            {node.label}
          </p>
          {node.subtitle && (
            <p className={`text-[11px] mt-0.5 leading-tight italic ${style.sub}`}>
              {node.subtitle}
            </p>
          )}
        </div>

        {hasChildren && (
          <button
            onClick={() => onToggleLayout(node.id)}
            title={isHorizontal ? "Cambiar a vertical" : "Cambiar a horizontal"}
            className={`
              absolute -top-2.5 -right-2.5 z-20
              w-5 h-5 rounded-full flex items-center justify-center
              border shadow-sm transition-all duration-150
              ${TOGGLE_BTN}
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
          {/* Stem from card center downward */}
          <div style={{ width: 1, height: 16, backgroundColor: CONNECTOR }} />

          {isHorizontal ? (
            <HorizontalGroup
              children={node.children}
              onToggleLayout={onToggleLayout}
            />
          ) : (
            <VerticalGroup
              children={node.children}
              onToggleLayout={onToggleLayout}
            />
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
      {count > 1 && (
        <div style={{ display: "flex", height: 0, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(50% / ${count})`,
              right: `calc(50% / ${count})`,
              height: 1,
              backgroundColor: CONNECTOR,
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
        {children.map((child) => (
          <div
            key={child.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 10px",
            }}
          >
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
  const last = children.length - 1;

  return (
    /*
     * alignSelf: stretch → this div expands to the full width of the parent
     * flex-column container, which is determined by max(card_width, children_total_width).
     *
     * Because the parent card is centered (alignItems: center on the column),
     * the card's center = 50% of the parent container width.
     * Since this VerticalGroup also stretches to that same width,
     * left: 50% of this div == the parent card's center == where the stem ends.
     *
     * The bridge line (top: 0, left: 0 → left: 50%) therefore connects:
     *   right end  → stem bottom (card center)
     *   left end   → spine (left: 0)
     * forming a proper L/T junction with no DOM measurement needed.
     */
    <div style={{ alignSelf: "stretch", position: "relative" }}>
      {/* Bridge: horizontal line from spine (left:0) to stem (left:50%) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: 1,
          backgroundColor: CONNECTOR,
        }}
      />

      {/* Children column, left-aligned so spine stays at left edge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {children.map((child, i) => {
          const isLast = i === last;
          return (
            <div
              key={child.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "5px 0",
              }}
            >
              {/* Spine column: 1px wide, full row height */}
              <div
                style={{
                  width: 1,
                  alignSelf: "stretch",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* Top half: connects from above (bridge or previous child) */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: "50%",
                    width: 1,
                    backgroundColor: CONNECTOR,
                  }}
                />
                {/* Bottom half: connects downward to next child (omit on last) */}
                {!isLast && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      bottom: 0,
                      width: 1,
                      backgroundColor: CONNECTOR,
                    }}
                  />
                )}
              </div>

              {/* Horizontal branch from spine to child card */}
              <div
                style={{
                  width: 20,
                  height: 1,
                  backgroundColor: CONNECTOR,
                  flexShrink: 0,
                }}
              />

              {/* Child node */}
              <OrgNodeComponent node={child} onToggleLayout={onToggleLayout} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
