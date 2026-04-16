import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  // Wait for all fonts (Open Sans from Google Fonts) to be available.
  await document.fonts.ready;

  // ── Strategy: inject a <style> into the LIVE document head ─────────────────
  // html2canvas reads text positions from the live DOM, not from the cloned
  // document.  onclone style changes therefore do NOT affect text placement.
  // Injecting a stylesheet into the live document is the only reliable way to
  // ensure html2canvas captures the correct metrics — it copies ALL <style>
  // tags to its clone, so the rules apply consistently there too.
  //
  // The two problems being fixed:
  //   1. Browser default margin on <p> (1em ≈ 16 px) — not reset inside the
  //      clone because Tailwind preflight may not apply there.
  //   2. half-leading from line-height > 1 — html2canvas adds the leading
  //      entirely above the first glyph rather than splitting it.
  //
  // We scope the selector to #<elementId> so the effect on the live page is
  // as narrow as possible; the style is removed in the finally block.
  const overrideId = "pdf-export-style-override";
  const overrideEl = document.createElement("style");
  overrideEl.id = overrideId;
  overrideEl.textContent = `
    #${elementId} p {
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1em !important;
    }
  `;
  document.head.appendChild(overrideEl);

  // ── Measure natural (zoom:1) dimensions without a visible flash ─────────────
  const prevZoom = element.style.zoom;
  element.style.zoom = "1";
  const naturalWidth  = element.scrollWidth;
  const naturalHeight = element.scrollHeight;
  element.style.zoom  = prevZoom;

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

        // Reset zoom and remove visual chrome in the clone.
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

        // Force layout reflow so flex positions are committed
        // before html2canvas reads bounding rects.
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
    // Always remove the injected override — even if html2canvas throws.
    document.getElementById(overrideId)?.remove();
  }
}
