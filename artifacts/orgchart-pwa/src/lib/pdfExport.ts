import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  await document.fonts.ready;

  // ── Remove the injected stylesheet from the previous attempt ───────────────
  document.getElementById("pdf-export-style-override")?.remove();

  // ── Inline-style override on every <p> in the live DOM ─────────────────────
  // html2canvas clones the live DOM, including each element's `style="…"`
  // attribute.  Inline styles are part of the HTML — html2canvas's CSS parser
  // cannot ignore them the way it sometimes ignores injected <style> tags.
  //
  // Using style.setProperty(prop, value, "important") writes the rule with
  // !important into the element's own style attribute, overriding every
  // class-based or browser-default rule both in the live doc and in the clone.
  //
  // Problems eliminated:
  //   1. Browser-default <p> margin-top: 1em (≈16 px) — not reset by Tailwind
  //      preflight in the clone context.
  //   2. Half-leading from leading-snug (line-height 1.375): html2canvas places
  //      the entire leading ABOVE the first glyph instead of splitting it,
  //      making text appear lower than center.  Setting line-height equal to
  //      font-size (0 half-leading) fixes the glyph baseline placement.
  //
  // We read font-size from the LIVE document's getComputedStyle — safe because
  // the element is in the same document as window, no cross-document issue.

  const paragraphs = Array.from(element.querySelectorAll<HTMLElement>("p"));

  // Save whatever inline styles were already set (usually empty strings).
  const saved = paragraphs.map((p) => ({
    margin:     p.style.getPropertyValue("margin"),
    marginPri:  p.style.getPropertyPriority("margin"),
    padding:    p.style.getPropertyValue("padding"),
    paddingPri: p.style.getPropertyPriority("padding"),
    lh:         p.style.getPropertyValue("line-height"),
    lhPri:      p.style.getPropertyPriority("line-height"),
  }));

  paragraphs.forEach((p) => {
    const fs = parseFloat(window.getComputedStyle(p).fontSize) || 12;
    p.style.setProperty("margin",      "0",        "important");
    p.style.setProperty("padding",     "0",        "important");
    p.style.setProperty("line-height", `${fs}px`,  "important");
  });

  // Force a synchronous reflow so the browser commits new positions before
  // html2canvas reads element rects (getBoundingClientRect / offsetHeight).
  void element.getBoundingClientRect();

  // ── Measure natural (zoom:1) dimensions ────────────────────────────────────
  const prevZoom = element.style.zoom;
  element.style.zoom = "1";
  void element.getBoundingClientRect(); // reflow at zoom:1
  const naturalWidth  = element.scrollWidth;
  const naturalHeight = element.scrollHeight;
  element.style.zoom  = prevZoom;
  void element.getBoundingClientRect(); // restore reflow

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width:        naturalWidth,
      height:       naturalHeight,
      windowWidth:  naturalWidth,
      windowHeight: naturalHeight,

      onclone: (_clonedDoc, clonedEl) => {
        const el = clonedEl as HTMLElement;

        // Zoom / visual chrome cleanup in the clone.
        el.style.zoom            = "1";
        el.style.boxShadow       = "none";
        el.style.borderRadius    = "0";
        el.style.padding         = "24px 32px 32px";
        el.style.backgroundColor = "#ffffff";

        el.querySelectorAll<HTMLElement>("*").forEach((child) => {
          if (child.style.boxShadow) child.style.boxShadow = "none";
        });

        el.querySelectorAll<HTMLElement>("button").forEach((btn) => {
          btn.style.display = "none";
        });

        void el.offsetHeight;
      },
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.88);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;

    const availWidth  = pageWidth  - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const ratio        = Math.min(availWidth / canvas.width, availHeight / canvas.height);
    const scaledWidth  = canvas.width  * ratio;
    const scaledHeight = canvas.height * ratio;

    const x = margin + (availWidth  - scaledWidth)  / 2;
    const y = margin + (availHeight - scaledHeight) / 2;

    pdf.addImage(imgData, "JPEG", x, y, scaledWidth, scaledHeight);

    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_organigrama.pdf`;
    pdf.save(fileName);

  } finally {
    // Restore original inline styles on every <p>.
    paragraphs.forEach((p, i) => {
      const s = saved[i];

      p.style.removeProperty("margin");
      if (s.margin) p.style.setProperty("margin", s.margin, s.marginPri);

      p.style.removeProperty("padding");
      if (s.padding) p.style.setProperty("padding", s.padding, s.paddingPri);

      p.style.removeProperty("line-height");
      if (s.lh) p.style.setProperty("line-height", s.lh, s.lhPri);
    });
  }
}
