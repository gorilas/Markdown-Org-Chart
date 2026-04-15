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

/*
 * SPACER_PX is the approximate distance from the LEFT edge of the VerticalGroup
 * to the spine. We want this to match the parent card's center so the spine
 * sits directly below the 16 px stem.
 *
 * Cards have:
 *   root  → minWidth 200, maxWidth 280  → center ≈ 110 px
 *   other → minWidth 150, maxWidth 230  → center ≈  95 px
 *
 * Using the min-half keeps the spacer safely inside the card for all widths.
 * A short "bridge" (left: SPACER → right: 50%) fills any remaining gap so the
 * spine always connects to the stem, even when children push the container wider.
 */
const SPACER_ROOT = 110; // px, ≈ half of root minWidth (200)
const SPACER_NODE = 75; // px, ≈ half of node minWidth (150)

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
              spacer={isRoot ? SPACER_ROOT : SPACER_NODE}
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

/**
 * VerticalGroup — renders children in a column with T-shaped connectors.
 *
 * Layout geometry (all measurements from the VerticalGroup container's left edge):
 *
 *   [parent card — centered at 50% of container]
 *          |                ← 16 px stem (centered, rendered in OrgNodeComponent)
 *   ━━━━━━━┘  ← bridge: absolute, top:0, left:SPACER → right:50%
 *   |            connects spine (≈ card center) to stem (exactly card center)
 *   ├──── child 1
 *   |
 *   └──── child 2
 *
 * The `alignSelf: stretch` makes this container fill the OrgNodeComponent wrapper
 * width, so `50%` of this container == the parent card's center == the stem.
 *
 * SPACER is the approximate half-width of the parent card (fixed constant).
 * The bridge covers any remaining distance between SPACER and the exact 50%.
 * With real cards (minWidth 150–200 px) the bridge is ≤ 40 px — visually clean.
 */
function VerticalGroup({
  children,
  onToggleLayout,
  spacer,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
  spacer: number;
}) {
  const last = children.length - 1;

  return (
    <div style={{ alignSelf: "stretch", position: "relative" }}>
      {/*
       * Bridge: horizontal segment from spine (left: spacer) to stem (right: 50%).
       * `right: 50%` anchors the right end at the container's horizontal centre,
       * which equals the parent card centre because the card is centred in the
       * same container (alignItems: center in OrgNodeComponent).
       */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: spacer,
          right: "50%",
          height: 1,
          backgroundColor: CONNECTOR,
        }}
      />

      {/* Children column — left-aligned, spine at right edge of spacer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
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
              {/*
               * Spacer column: SPACER px wide, carries the vertical spine
               * at its right edge (right: 0).  Using right: 0 inside a
               * position:relative box pins the spine at exactly SPACER px
               * from the container's left — the same x as the bridge's left end.
               */}
              <div
                style={{
                  width: spacer,
                  alignSelf: "stretch",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* Top-half spine: from row top to row vertical centre */}
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: "50%",
                    width: 1,
                    backgroundColor: CONNECTOR,
                  }}
                />
                {/* Bottom-half spine: from row centre to row bottom (skip on last child) */}
                {!isLast && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      bottom: 0,
                      width: 1,
                      backgroundColor: CONNECTOR,
                    }}
                  />
                )}
              </div>

              {/* Horizontal branch: 20 px rightward from spine to child card */}
              <div
                style={{
                  width: 20,
                  height: 1,
                  backgroundColor: CONNECTOR,
                  flexShrink: 0,
                }}
              />

              {/* Child subtree */}
              <OrgNodeComponent node={child} onToggleLayout={onToggleLayout} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
