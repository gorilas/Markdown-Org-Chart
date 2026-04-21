import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { NodePosition, OrgNode as OrgNodeType } from "@/lib/markdownParser";
import { AlignJustify, AlignCenter, ChevronLeft, ChevronRight } from "lucide-react";

interface OrgNodeProps {
  node: OrgNodeType;
  onToggleLayout: (id: string) => void;
  onSetPosition: (id: string, position: NodePosition) => void;
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

const TOGGLE_BTN_BASE =
  "w-5 h-5 rounded-full flex items-center justify-center border shadow-sm transition-colors";
const TOGGLE_BTN =
  "bg-desy-blue text-white border-desy-blue-dark hover:bg-desy-blue-dark";
const TOGGLE_BTN_ACTIVE =
  "bg-desy-blue-dark text-white border-desy-blue-dark hover:bg-desy-blue";

export function OrgNodeComponent({
  node,
  onToggleLayout,
  onSetPosition,
  isRoot = false,
}: OrgNodeProps) {
  const hasChildren = node.children.length > 0;
  const isHorizontal = node.layout === "horizontal";
  const isLevel1 = node.level === 1;
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

  // Split root children into lateral / cascade buckets
  const leftLaterals = isRoot
    ? node.children.filter((c) => c.position === "lateral-left")
    : [];
  const rightLaterals = isRoot
    ? node.children.filter((c) => c.position === "lateral-right")
    : [];
  const cascadeChildren = isRoot
    ? node.children.filter((c) => c.position !== "lateral-left" && c.position !== "lateral-right")
    : node.children;
  const hasLaterals = leftLaterals.length > 0 || rightLaterals.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Card */}
      <div style={{ position: "relative" }} className="group">
        <div
          ref={cardRef}
          data-orgcard=""
          className={`rounded-sm border-2 px-3 py-2 flex flex-col items-center justify-center text-center ${style.card}`}
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

        {/* Floating action buttons on the top edge of the card */}
        {(hasChildren || isLevel1) && (
          <div
            className="absolute -top-2.5 right-0 z-20 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
            style={{ transform: "translateX(8px)" }}
          >
            {isLevel1 && (() => {
              const active = node.position === "lateral-left";
              const label = active ? "Volver a cascada" : "Colocar a la izquierda";
              return (
                <button
                  onClick={() =>
                    onSetPosition(node.id, active ? "cascade" : "lateral-left")
                  }
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className={`${TOGGLE_BTN_BASE} ${active ? TOGGLE_BTN_ACTIVE : TOGGLE_BTN}`}
                >
                  <ChevronLeft size={11} />
                </button>
              );
            })()}
            {hasChildren && (() => {
              const label = isHorizontal ? "Cambiar a disposición vertical" : "Cambiar a disposición horizontal";
              return (
                <button
                  onClick={() => onToggleLayout(node.id)}
                  title={label}
                  aria-label={label}
                  className={`${TOGGLE_BTN_BASE} ${TOGGLE_BTN}`}
                >
                  {isHorizontal ? <AlignJustify size={9} /> : <AlignCenter size={9} />}
                </button>
              );
            })()}
            {isLevel1 && (() => {
              const active = node.position === "lateral-right";
              const label = active ? "Volver a cascada" : "Colocar a la derecha";
              return (
                <button
                  onClick={() =>
                    onSetPosition(node.id, active ? "cascade" : "lateral-right")
                  }
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className={`${TOGGLE_BTN_BASE} ${active ? TOGGLE_BTN_ACTIVE : TOGGLE_BTN}`}
                >
                  <ChevronRight size={11} />
                </button>
              );
            })()}
          </div>
        )}
      </div>

      {/* Children: either the special root layout (with laterals) or the standard layouts */}
      {hasChildren && (
        <>
          {isRoot && hasLaterals ? (
            <RootLateralLayout
              cascadeChildren={cascadeChildren}
              leftLaterals={leftLaterals}
              rightLaterals={rightLaterals}
              parentLayout={node.layout}
              parentCenterX={parentCenterX}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
            />
          ) : (
            cascadeChildren.length > 0 && (
              <>
                <div style={{ width: 1, height: 16, backgroundColor: CONNECTOR }} />
                {isHorizontal ? (
                  <HorizontalGroup
                    children={cascadeChildren}
                    onToggleLayout={onToggleLayout}
                    onSetPosition={onSetPosition}
                  />
                ) : (
                  <VerticalGroup
                    children={cascadeChildren}
                    onToggleLayout={onToggleLayout}
                    onSetPosition={onSetPosition}
                    parentCenterX={parentCenterX}
                  />
                )}
              </>
            )
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
  onSetPosition,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
  onSetPosition: (id: string, position: NodePosition) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
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
            <OrgNodeComponent
              node={child}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * VerticalGroup — children stacked vertically with T-junction connectors.
 * See module-level comments for geometry details (unchanged from original).
 */
function VerticalGroup({
  children,
  onToggleLayout,
  onSetPosition,
  parentCenterX,
}: {
  children: OrgNodeType[];
  onToggleLayout: (id: string) => void;
  onSetPosition: (id: string, position: NodePosition) => void;
  parentCenterX: number;
}) {
  const last = children.length - 1;

  return (
    <div style={{ alignSelf: "stretch", position: "relative" }}>
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

              <div style={{ width: parentCenterX, flexShrink: 0 }} />
              <div style={{ width: 20, height: 1, backgroundColor: CONNECTOR, flexShrink: 0 }} />

              <OrgNodeComponent
                node={child}
                onToggleLayout={onToggleLayout}
                onSetPosition={onSetPosition}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
 * RootLateralLayout — used only when the root has at least one lateral child.
 *
 * Geometry (3-column flex row, gap 16):
 *
 *   ┌──────────────┬──────────────────────┬──────────────┐
 *   │ left column  │   cascade column     │ right column │
 *   │ (laterals)   │   (spine spacer +    │  (laterals)  │
 *   │              │    H/V cascade)      │              │
 *   └──────────────┴──────────────────────┴──────────────┘
 *
 * Both side columns are forced to the same min-width (max of measured
 * natural widths) so the cascade column ends up centred — which means its
 * horizontal centre coincides with the parent card's centre (the parent card
 * is centred over the wrapper by alignItems:center on the OrgNode wrapper).
 *
 * The cascade column starts with a "spine zone" spacer whose height equals
 * the tallest side column's content height plus 16 px. A single absolute
 * vertical line is drawn through it at left:50%, replacing the usual 16-px
 * stem. Each lateral row gets a horizontal connector (absolute, in the
 * wrapper) drawn from the spine X to that lateral card's inner edge at the
 * card's vertical centre.
 */
function RootLateralLayout({
  cascadeChildren,
  leftLaterals,
  rightLaterals,
  parentLayout,
  parentCenterX,
  onToggleLayout,
  onSetPosition,
}: {
  cascadeChildren: OrgNodeType[];
  leftLaterals: OrgNodeType[];
  rightLaterals: OrgNodeType[];
  parentLayout: "horizontal" | "vertical";
  parentCenterX: number;
  onToggleLayout: (id: string) => void;
  onSetPosition: (id: string, position: NodePosition) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cascadeColRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  type Geom = {
    spineX: number;
    spineHeight: number; // height of the spacer above cascade group, in cascade column
    sideMin: number;
    leftConnectors: { y: number; fromX: number }[];
    rightConnectors: { y: number; toX: number }[];
  };

  const [geom, setGeom] = useState<Geom>({
    spineX: 0,
    spineHeight: 0,
    sideMin: 0,
    leftConnectors: [],
    rightConnectors: [],
  });

  // Track previous values to break feedback loops in the ResizeObserver
  const lastGeomRef = useRef<Geom>(geom);

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current;
      const cascadeCol = cascadeColRef.current;
      const leftCol = leftColRef.current;
      const rightCol = rightColRef.current;
      if (!wrapper || !cascadeCol) return;

      const wRect = wrapper.getBoundingClientRect();
      const cRect = cascadeCol.getBoundingClientRect();

      // Side natural widths: temporarily strip applied min-width to read intrinsic content size.
      const measureNaturalWidth = (el: HTMLDivElement | null): number => {
        if (!el) return 0;
        const prev = el.style.minWidth;
        el.style.minWidth = "0";
        // Force reflow
        const w = el.scrollWidth;
        el.style.minWidth = prev;
        return w;
      };
      const lw = measureNaturalWidth(leftCol);
      const rw = measureNaturalWidth(rightCol);
      const sideMin = Math.max(lw, rw);

      const lh = leftCol?.scrollHeight ?? 0;
      const rh = rightCol?.scrollHeight ?? 0;
      const spineHeight = Math.max(lh, rh);

      const spineX = cRect.left + cRect.width / 2 - wRect.left;

      const leftConnectors = leftLaterals.map((_, i) => {
        const row = leftRowRefs.current[i];
        if (!row) return { y: 0, fromX: 0 };
        const card = row.querySelector<HTMLElement>("[data-orgcard]");
        const target = card ?? row;
        const r = target.getBoundingClientRect();
        return {
          y: r.top + r.height / 2 - wRect.top,
          fromX: r.right - wRect.left,
        };
      });
      const rightConnectors = rightLaterals.map((_, i) => {
        const row = rightRowRefs.current[i];
        if (!row) return { y: 0, toX: 0 };
        const card = row.querySelector<HTMLElement>("[data-orgcard]");
        const target = card ?? row;
        const r = target.getBoundingClientRect();
        return {
          y: r.top + r.height / 2 - wRect.top,
          toX: r.left - wRect.left,
        };
      });

      const next: Geom = { spineX, spineHeight, sideMin, leftConnectors, rightConnectors };

      const prev = lastGeomRef.current;
      const close = (a: number, b: number) => Math.abs(a - b) < 0.5;
      const sameConnList = (
        a: { y: number; fromX?: number; toX?: number }[],
        b: { y: number; fromX?: number; toX?: number }[],
      ) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!close(a[i].y, b[i].y)) return false;
          if (a[i].fromX !== undefined && !close(a[i].fromX!, b[i].fromX!)) return false;
          if (a[i].toX !== undefined && !close(a[i].toX!, b[i].toX!)) return false;
        }
        return true;
      };
      if (
        close(prev.spineX, next.spineX) &&
        close(prev.spineHeight, next.spineHeight) &&
        close(prev.sideMin, next.sideMin) &&
        sameConnList(prev.leftConnectors, next.leftConnectors) &&
        sameConnList(prev.rightConnectors, next.rightConnectors)
      ) {
        return;
      }
      lastGeomRef.current = next;
      setGeom(next);
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (cascadeColRef.current) ro.observe(cascadeColRef.current);
    if (leftColRef.current) ro.observe(leftColRef.current);
    if (rightColRef.current) ro.observe(rightColRef.current);
    return () => ro.disconnect();
  }, [leftLaterals.length, rightLaterals.length, cascadeChildren.length, parentLayout]);

  const isHorizontal = parentLayout === "horizontal";
  const SPINE_PAD = 16; // pixels of extra spine below the laterals zone, before the cascade group

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 16,
        alignSelf: "stretch",
      }}
    >
      {/* Central vertical spine */}
      <div
        style={{
          position: "absolute",
          left: geom.spineX - 0.5,
          top: 0,
          height: Math.max(0, geom.spineHeight + SPINE_PAD),
          width: 1,
          backgroundColor: CONNECTOR,
          pointerEvents: "none",
        }}
      />

      {/* Horizontal connectors, left side */}
      {geom.leftConnectors.map((c, i) => (
        <div
          key={`lc-${i}`}
          style={{
            position: "absolute",
            left: c.fromX,
            top: c.y - 0.5,
            width: Math.max(0, geom.spineX - c.fromX),
            height: 1,
            backgroundColor: CONNECTOR,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Horizontal connectors, right side */}
      {geom.rightConnectors.map((c, i) => (
        <div
          key={`rc-${i}`}
          style={{
            position: "absolute",
            left: geom.spineX,
            top: c.y - 0.5,
            width: Math.max(0, c.toX - geom.spineX),
            height: 1,
            backgroundColor: CONNECTOR,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Left lateral column (subtrees right-aligned) */}
      <div
        ref={leftColRef}
        style={{
          minWidth: geom.sideMin,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        {leftLaterals.map((child, i) => (
          <div
            key={child.id}
            ref={(el) => {
              leftRowRefs.current[i] = el;
            }}
          >
            <OrgNodeComponent
              node={child}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
            />
          </div>
        ))}
      </div>

      {/* Cascade column */}
      <div
        ref={cascadeColRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Spine spacer: matches the lateral zone height + extra padding */}
        <div
          style={{
            height: geom.spineHeight + SPINE_PAD,
            flexShrink: 0,
          }}
        />

        {cascadeChildren.length > 0 ? (
          isHorizontal ? (
            <HorizontalGroup
              children={cascadeChildren}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
            />
          ) : (
            <VerticalGroup
              children={cascadeChildren}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
              parentCenterX={parentCenterX}
            />
          )
        ) : null}
      </div>

      {/* Right lateral column (subtrees left-aligned) */}
      <div
        ref={rightColRef}
        style={{
          minWidth: geom.sideMin,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        {rightLaterals.map((child, i) => (
          <div
            key={child.id}
            ref={(el) => {
              rightRowRefs.current[i] = el;
            }}
          >
            <OrgNodeComponent
              node={child}
              onToggleLayout={onToggleLayout}
              onSetPosition={onSetPosition}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
