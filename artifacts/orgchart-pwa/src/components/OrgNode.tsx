import { ReactNode, useRef, useState, useLayoutEffect } from "react";
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
   * Measure the card's rendered pixel width so the vertical trunk in
   * VerticalGroup can be placed exactly under the card's centre. Initial
   * value = half of minWidth, used for the first paint before
   * ResizeObserver fires (avoids a visible flash). useLayoutEffect runs
   * synchronously before paint so the measurement is applied immediately.
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const [parentCenterX, setParentCenterX] = useState(isRoot ? 100 : 75);

  useLayoutEffect(() => {
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

  const cardJSX: ReactNode = (
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
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/*
       * Card area. When the root has lateral children, wrap the card in a
       * 3-column row [leftLaterals · CARD · rightLaterals] so the laterals
       * sit right next to the card. The cascade below stays in the normal
       * flow centred under the wrapper, identical to the non-lateral case.
       */}
      {isRoot && hasLaterals ? (
        <CardWithLaterals
          leftLaterals={leftLaterals}
          rightLaterals={rightLaterals}
          onToggleLayout={onToggleLayout}
          onSetPosition={onSetPosition}
        >
          {cardJSX}
        </CardWithLaterals>
      ) : (
        cardJSX
      )}

      {/* Cascade children (below the card / lateral row) */}
      {cascadeChildren.length > 0 && (
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

  useLayoutEffect(() => {
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
 * VerticalGroup — children stacked vertically with a single continuous
 * trunk on the left. Each child has a short horizontal stub from the trunk
 * to its card. The trunk extends from the top of the group down to the
 * vertical centre of the last child (measured via ResizeObserver).
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
  const groupRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geom, setGeom] = useState<{ trunkHeight: number; stubsY: number[] }>({
    trunkHeight: 0,
    stubsY: [],
  });

  useLayoutEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const measure = () => {
      const groupTop = el.getBoundingClientRect().top;
      const stubsY = rowRefs.current.map((row) => {
        if (!row) return 0;
        // Measure the child's CARD (not the row, which may include the
        // child's own descendants below the card).
        const card = row.querySelector<HTMLElement>("[data-orgcard]");
        const target = card ?? row;
        const r = target.getBoundingClientRect();
        return r.top + r.height / 2 - groupTop;
      });
      const lastY = stubsY.length > 0 ? stubsY[stubsY.length - 1] : 0;
      setGeom({ trunkHeight: Math.max(0, lastY), stubsY });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    rowRefs.current.forEach((row) => row && ro.observe(row));
    return () => ro.disconnect();
  }, [children.length]);

  const STUB = 18;

  return (
    <div
      ref={groupRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      {/* Single continuous trunk */}
      <div
        style={{
          position: "absolute",
          left: parentCenterX - 0.5,
          top: 0,
          width: 1,
          height: geom.trunkHeight,
          backgroundColor: CONNECTOR,
          pointerEvents: "none",
        }}
      />

      {/* Per-child horizontal stubs, drawn absolutely at each card's centre y */}
      {geom.stubsY.map((y, i) => (
        <div
          key={`vstub-${i}`}
          style={{
            position: "absolute",
            left: parentCenterX,
            top: y - 0.5,
            width: STUB,
            height: 1,
            backgroundColor: CONNECTOR,
            pointerEvents: "none",
          }}
        />
      ))}

      {children.map((child, i) => (
        <div
          key={child.id}
          ref={(el) => {
            rowRefs.current[i] = el;
          }}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          {/* Spacer reserves the trunk + stub area on the left */}
          <div style={{ width: parentCenterX + STUB, flexShrink: 0 }} />
          <OrgNodeComponent
            node={child}
            onToggleLayout={onToggleLayout}
            onSetPosition={onSetPosition}
          />
        </div>
      ))}
    </div>
  );
}

/*
 * CardWithLaterals — used only when the root has at least one lateral child.
 *
 *   ┌──────────────┬──────────────────────┬──────────────┐
 *   │ leftLaterals │   ROOT CARD (slot)   │ rightLaterals│
 *   └──────────────┴──────────────────────┴──────────────┘
 *
 * Both side columns are forced to the same min-width (max of measured
 * natural widths) so the root card stays centred in the row. Because the
 * card is the centre column (not the cascade), the row's total width is
 * small — so each lateral sits a short distance from the card and its
 * connector line is short.
 *
 * Connectors:
 * - A short horizontal line from each lateral card's inner edge to the
 *   root card's outer edge, at the lateral card's vertical centre.
 * - When laterals on a side extend above or below the card vertically, a
 *   thin vertical bar is drawn flush with the card's outer edge so all
 *   connectors meet a continuous spine. The portion of the bar overlapping
 *   the card is hidden behind the card (z-index ordering).
 *
 * The vertical "stem" between root card and cascade is the regular 16-px
 * connector rendered by OrgNodeComponent below this row.
 */
function CardWithLaterals({
  leftLaterals,
  rightLaterals,
  onToggleLayout,
  onSetPosition,
  children,
}: {
  leftLaterals: OrgNodeType[];
  rightLaterals: OrgNodeType[];
  onToggleLayout: (id: string) => void;
  onSetPosition: (id: string, position: NodePosition) => void;
  children: ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardSlotRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const leftRowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRowRefs = useRef<(HTMLDivElement | null)[]>([]);

  type Bar = { top: number; height: number };
  type Conn = { y: number; fromX: number; toX: number };
  type Geom = {
    sideMin: number;
    cardLeft: number;
    cardRight: number;
    cardCenterX: number;
    cardBottom: number;
    spineExtension: number;
    leftBar: Bar | null;
    rightBar: Bar | null;
    leftConnectors: Conn[];
    rightConnectors: Conn[];
  };

  const [geom, setGeom] = useState<Geom>({
    sideMin: 0,
    cardLeft: 0,
    cardRight: 0,
    cardCenterX: 0,
    cardBottom: 0,
    spineExtension: 0,
    leftBar: null,
    rightBar: null,
    leftConnectors: [],
    rightConnectors: [],
  });

  const lastGeomRef = useRef<Geom>(geom);

  useLayoutEffect(() => {
    const measure = () => {
      const wrapper = wrapperRef.current;
      const cardSlot = cardSlotRef.current;
      if (!wrapper || !cardSlot) return;

      const wRect = wrapper.getBoundingClientRect();

      // Side natural widths: temporarily strip applied min-width to read
      // intrinsic content size.
      const measureNaturalWidth = (el: HTMLDivElement | null): number => {
        if (!el) return 0;
        const prev = el.style.minWidth;
        el.style.minWidth = "0";
        const w = el.scrollWidth;
        el.style.minWidth = prev;
        return w;
      };
      const lw = measureNaturalWidth(leftColRef.current);
      const rw = measureNaturalWidth(rightColRef.current);
      const sideMin = Math.max(lw, rw);

      // Find the root card via its data attribute. cardSlot only contains
      // the root card (no lateral OrgNodeComponents are descendants of it),
      // so this query is unambiguous.
      const rootCard = cardSlot.querySelector<HTMLElement>("[data-orgcard]");
      if (!rootCard) return;
      const cRect = rootCard.getBoundingClientRect();
      const cardLeft = cRect.left - wRect.left;
      const cardRight = cRect.right - wRect.left;
      const cardTop = cRect.top - wRect.top;
      const cardBottom = cRect.bottom - wRect.top;

      const measureSide = (
        laterals: OrgNodeType[],
        rowRefs: (HTMLDivElement | null)[],
        side: "left" | "right",
      ): Conn[] => {
        return laterals.map((_, i) => {
          const row = rowRefs[i];
          if (!row) {
            return {
              y: 0,
              fromX: side === "left" ? 0 : cardRight,
              toX: side === "left" ? cardLeft : 0,
            };
          }
          const card = row.querySelector<HTMLElement>("[data-orgcard]");
          const target = card ?? row;
          const r = target.getBoundingClientRect();
          const y = r.top + r.height / 2 - wRect.top;
          if (side === "left") {
            return { y, fromX: r.right - wRect.left, toX: cardLeft };
          }
          return { y, fromX: cardRight, toX: r.left - wRect.left };
        });
      };

      const leftConnectors = measureSide(leftLaterals, leftRowRefs.current, "left");
      const rightConnectors = measureSide(rightLaterals, rightRowRefs.current, "right");

      // Vertical bar at the card's outer edge, spanning from the topmost
      // connector to the bottommost (always extended to at least cover the
      // card's vertical range so it visually meets the card).
      const computeBar = (conns: Conn[]): Bar | null => {
        if (conns.length === 0) return null;
        const ys = conns.map((c) => c.y);
        const minY = Math.min(cardTop, ...ys);
        const maxY = Math.max(cardBottom, ...ys);
        return { top: minY, height: Math.max(0, maxY - minY) };
      };
      const leftBar = computeBar(leftConnectors);
      const rightBar = computeBar(rightConnectors);

      // Wrapper height = max content height across the row. With
      // alignItems:flex-start the card sits at top (cardTop ~ 0). Any
      // extra space below cardBottom must be covered by an extension of
      // the central spine so it visually meets the cascade stem rendered
      // immediately after this wrapper.
      const wrapperHeight = wRect.height;
      const cardCenterX = (cardLeft + cardRight) / 2;
      const spineExtension = Math.max(0, wrapperHeight - cardBottom);

      const next: Geom = {
        sideMin,
        cardLeft,
        cardRight,
        cardCenterX,
        cardBottom,
        spineExtension,
        leftBar,
        rightBar,
        leftConnectors,
        rightConnectors,
      };

      const prev = lastGeomRef.current;
      const close = (a: number, b: number) => Math.abs(a - b) < 0.5;
      const sameBar = (a: Bar | null, b: Bar | null) => {
        if (!a && !b) return true;
        if (!a || !b) return false;
        return close(a.top, b.top) && close(a.height, b.height);
      };
      const sameConns = (a: Conn[], b: Conn[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!close(a[i].y, b[i].y)) return false;
          if (!close(a[i].fromX, b[i].fromX)) return false;
          if (!close(a[i].toX, b[i].toX)) return false;
        }
        return true;
      };
      if (
        close(prev.sideMin, next.sideMin) &&
        close(prev.cardLeft, next.cardLeft) &&
        close(prev.cardRight, next.cardRight) &&
        close(prev.cardCenterX, next.cardCenterX) &&
        close(prev.cardBottom, next.cardBottom) &&
        close(prev.spineExtension, next.spineExtension) &&
        sameBar(prev.leftBar, next.leftBar) &&
        sameBar(prev.rightBar, next.rightBar) &&
        sameConns(prev.leftConnectors, next.leftConnectors) &&
        sameConns(prev.rightConnectors, next.rightConnectors)
      ) {
        return;
      }
      lastGeomRef.current = next;
      setGeom(next);
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (cardSlotRef.current) ro.observe(cardSlotRef.current);
    if (leftColRef.current) ro.observe(leftColRef.current);
    if (rightColRef.current) ro.observe(rightColRef.current);
    return () => ro.disconnect();
  }, [leftLaterals.length, rightLaterals.length]);

  const GAP = 24;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: GAP,
      }}
    >
      {/* Central spine extension: from card bottom down to the wrapper
          bottom, so the cascade stem rendered below joins continuously to
          the root card even when lateral columns are taller than the card. */}
      {geom.spineExtension > 0 && (
        <div
          style={{
            position: "absolute",
            left: geom.cardCenterX - 0.5,
            top: geom.cardBottom,
            width: 1,
            height: geom.spineExtension,
            backgroundColor: CONNECTOR,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Vertical bars at card edges (behind the card) */}
      {geom.leftBar && geom.leftBar.height > 0 && leftLaterals.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: geom.cardLeft - 0.5,
            top: geom.leftBar.top,
            width: 1,
            height: geom.leftBar.height,
            backgroundColor: CONNECTOR,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {geom.rightBar && geom.rightBar.height > 0 && rightLaterals.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: geom.cardRight - 0.5,
            top: geom.rightBar.top,
            width: 1,
            height: geom.rightBar.height,
            backgroundColor: CONNECTOR,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Horizontal connectors (behind the cards) */}
      {geom.leftConnectors.map((c, i) => (
        <div
          key={`lc-${i}`}
          style={{
            position: "absolute",
            left: c.fromX,
            top: c.y - 0.5,
            width: Math.max(0, c.toX - c.fromX),
            height: 1,
            backgroundColor: CONNECTOR,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      ))}
      {geom.rightConnectors.map((c, i) => (
        <div
          key={`rc-${i}`}
          style={{
            position: "absolute",
            left: c.fromX,
            top: c.y - 0.5,
            width: Math.max(0, c.toX - c.fromX),
            height: 1,
            backgroundColor: CONNECTOR,
            zIndex: 0,
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
          position: "relative",
          zIndex: 1,
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

      {/* Root card slot */}
      <div ref={cardSlotRef} style={{ position: "relative", zIndex: 1 }}>
        {children}
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
          position: "relative",
          zIndex: 1,
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
