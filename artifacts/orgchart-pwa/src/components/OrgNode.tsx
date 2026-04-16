import { useRef, useState, useEffect } from "react";
import { OrgNode as OrgNodeType } from "@/lib/markdownParser";
import { AlignJustify, AlignCenter } from "lucide-react";

interface OrgNodeProps {
  node: OrgNodeType;
  onToggleLayout: (id: string) => void;
  isRoot?: boolean;
}

const CONNECTOR = "var(--color-desy-border)";

const CARD_STYLES = [
  {
    card: "bg-desy-blue-light text-desy-dark border-desy-blue",
    badge: "text-desy-blue",
    sub: "text-desy-text",
  },
  {
    card: "bg-white text-desy-dark border-desy-blue",
    badge: "",
    sub: "text-desy-muted",
  },
  {
    card: "bg-desy-page text-desy-text border-desy-border",
    badge: "",
    sub: "text-desy-muted",
  },
];

const TOGGLE_BTN =
  "bg-desy-blue text-white border-desy-blue-dark hover:bg-desy-blue-dark";

export function OrgNodeComponent({
  node,
  onToggleLayout,
  isRoot = false,
}: OrgNodeProps) {
  const hasChildren = node.children.length > 0;
  const isHorizontal = node.layout === "horizontal";
  const style = CARD_STYLES[Math.min(node.level, CARD_STYLES.length - 1)];

  /*
   * Measure the card's rendered pixel width so the vertical spine is placed
   * exactly under the card's centre. Initial value = half of minWidth, used
   * for the first paint before ResizeObserver fires (avoids a visible flash).
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const [parentCenterX, setParentCenterX] = useState(isRoot ? 100 : 75);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const update = () => setParentCenterX(el.offsetWidth / 2);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Card */}
      <div style={{ position: "relative" }} className="group">
        <div
          ref={cardRef}
          data-orgcard=""
          className={`rounded-sm border-2 px-3 py-2 text-center ${style.card}`}
          style={{
            minWidth: isRoot ? 200 : 150,
            maxWidth: isRoot ? 280 : 230,
            boxShadow: isRoot
              ? "0 2px 8px rgba(0,96,122,0.20)"
              : "0 1px 3px rgba(0,0,0,0.07)",
          }}
        >
          {isRoot && (
            <div className={`text-[9px] font-semibold uppercase tracking-widest mb-0.5 ${style.badge}`}>
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

      {/* Stem + children */}
      {hasChildren && (
        <>
          <div style={{ width: 1, height: 16, backgroundColor: CONNECTOR }} />

          {isHorizontal ? (
            <HorizontalGroup children={node.children} onToggleLayout={onToggleLayout} />
          ) : (
            <VerticalGroup
              children={node.children}
              onToggleLayout={onToggleLayout}
              parentCenterX={parentCenterX}
            />
          )}
        </>
      )}
    </div>
  );
}

/*
 * HorizontalGroup — children laid out side by side.
 *
 * The horizontal connector spans from the centre of the first child column
 * to the centre of the last child column. Because columns can have very
 * different widths (each one contains a full subtree), using a percentage
 * formula (50% / count) gives wrong results. Instead we measure the actual
 * rendered widths of the first and last columns via a ResizeObserver on the
 * row element and derive pixel-accurate left/right values.
 */
function HorizontalGroup({
  children,
  onToggleLayout,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // lineLeft  = pixels from left edge  to centre of first column
  // lineRight = pixels from right edge to centre of last column
  const [lineLeft, setLineLeft] = useState<number | null>(null);
  const [lineRight, setLineRight] = useState<number | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || children.length < 2) return;

    const measure = () => {
      const cols = row.querySelectorAll<HTMLElement>(":scope > div");
      if (cols.length < 2) return;
      const first = cols[0];
      const last = cols[cols.length - 1];
      setLineLeft(first.offsetWidth / 2);
      setLineRight(last.offsetWidth / 2);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(row);
    measure();
    return () => ro.disconnect();
  }, [children.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
      {/* Horizontal connector — rendered in a zero-height strip above the row */}
      {children.length > 1 && lineLeft !== null && lineRight !== null && (
        <div style={{ position: "relative", height: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: lineLeft,
              right: lineRight,
              height: 1,
              backgroundColor: CONNECTOR,
            }}
          />
        </div>
      )}
      <div
        ref={rowRef}
        style={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}
      >
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

/*
 * VerticalGroup — children stacked vertically with T-junction connectors.
 *
 * Geometry (x measured from the VerticalGroup's left edge, which = OrgNode wrapper left):
 *
 *   [card centred at 50% of OrgNode wrapper]
 *        │   ← 16 px stem above this component
 *   ─────┘   ← bridge: absolute in stretch-div, left=parentCenterX, right="50%"
 *   │            connects spine (≈ card centre) to exact stem bottom (right=50%)
 *   ├──── child 1
 *   │
 *   └──── child 2
 *
 * Key insight: the spine is positioned with `position:absolute, left:parentCenterX`
 * on the ROW div (not inside the spacer column). This ensures it spans the full
 * row height including top/bottom padding, so consecutive rows' spines touch
 * and the bridge (rendered above in an alignSelf:stretch wrapper) connects
 * seamlessly at y=0 without any gap.
 */
function VerticalGroup({
  children,
  onToggleLayout,
  parentCenterX,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
  parentCenterX: number;
}) {
  const last = children.length - 1;

  return (
    /*
     * alignSelf:stretch makes this div fill the OrgNode wrapper's cross-size (width),
     * so right:"50%" on the bridge resolves to exactly half of the wrapper width,
     * which equals the centred card's horizontal midpoint.
     */
    <div style={{ alignSelf: "stretch", position: "relative" }}>
      {/* Bridge: from spine (left:parentCenterX) to stem bottom (right:50% = wrapper centre) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: parentCenterX,
          right: "50%",
          height: 1,
          backgroundColor: CONNECTOR,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {children.map((child, i) => {
          const isLast = i === last;
          return (
            /*
             * position:relative here makes this row the containing block for the
             * spine segments. The spine is therefore positioned relative to the
             * row's full box (including padding), so:
             *   top:0   = top edge of the row (including padding-top)
             *   50%     = vertical midpoint of the row  ≡  alignItems:center position
             *   bottom:0 = bottom edge of the row (including padding-bottom)
             *
             * Consecutive rows share a border at their top/bottom edges, so each
             * bottom-half spine exactly touches the next row's top-half spine.
             * The bridge above also touches the first row's spine at y=0.
             */
            <div
              key={child.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: "5px 0",
                position: "relative",
              }}
            >
              {/* Spine: top half — from row top to row vertical centre */}
              <div
                style={{
                  position: "absolute",
                  left: parentCenterX,
                  top: 0,
                  height: "50%",
                  width: 1,
                  backgroundColor: CONNECTOR,
                }}
              />
              {/* Spine: bottom half — from row centre to row bottom (skip on last child) */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: parentCenterX,
                    top: "50%",
                    bottom: 0,
                    width: 1,
                    backgroundColor: CONNECTOR,
                  }}
                />
              )}

              {/* Spacer: pushes branch and child card to start at parentCenterX */}
              <div style={{ width: parentCenterX, flexShrink: 0 }} />

              {/* Horizontal branch from spine to child card */}
              <div style={{ width: 20, height: 1, backgroundColor: CONNECTOR, flexShrink: 0 }} />

              {/* Child subtree */}
              <OrgNodeComponent node={child} onToggleLayout={onToggleLayout} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
