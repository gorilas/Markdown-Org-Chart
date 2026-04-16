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

  // ── Measure natural (zoom:1) dimensions without a visible flash ─────────────
  // Synchronous DOM read: set zoom → access scrollWidth (forces reflow) → restore.
  // Because we restore before yielding to the event loop, no paint occurs in between.
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
      // Tell html2canvas the NATURAL (unzoomed) dimensions so it captures the
      // full chart and not just the visually-scaled slice.
      width:        naturalWidth,
      height:       naturalHeight,
      windowWidth:  naturalWidth,
      windowHeight: naturalHeight,

      // ── onclone: modify the CLONED document, never the live DOM ────────────
      // This avoids any layout-reflow race conditions in the live page.
      onclone: (_clonedDoc, clonedEl) => {
        const el = clonedEl as HTMLElement;

        // Reset zoom to 1 so the clone renders at full size.
        el.style.zoom            = "1";
        el.style.boxShadow       = "none";
        el.style.borderRadius    = "0";
        el.style.padding         = "24px 32px 32px";
        el.style.backgroundColor = "#ffffff";

        // Remove inline box-shadows from every descendant (card shadows).
        el.querySelectorAll<HTMLElement>("*").forEach((child) => {
          if (child.style.boxShadow) child.style.boxShadow = "none";
        });

        // Hide every button (H/V toggle circles).
        el.querySelectorAll<HTMLElement>("button").forEach((btn) => {
          btn.style.display = "none";
        });

        // ── Vertical centering fix for node card text ─────────────────────────
        //
        // The card component already uses flex + justify-center (via Tailwind
        // classes) so the BROWSER computes the correct position of each <p>
        // BEFORE html2canvas reads it.  All we must do here is ensure:
        //
        // 1. Paragraph margins are zero (browser default is 1em which can
        //    add unexpected space if Tailwind preflight is not fully applied
        //    in the cloned document).
        //
        // 2. line-height collapses to exactly font-size (no half-leading).
        //    IMPORTANT: use explicit pixel values — a bare "1" may be parsed
        //    as 1 px instead of 1 × font-size in the clone's rendering context.
        //    We read font-size from the clone's own getComputedStyle so the
        //    value is always correct regardless of text scale.
        //
        // 3. Force a synchronous layout reflow (by reading offsetHeight) so
        //    every flex position is committed before html2canvas reads rects.
        const cloneWin = _clonedDoc.defaultView ?? window;
        el.querySelectorAll<HTMLElement>("p").forEach((p) => {
          const fs = parseFloat(cloneWin.getComputedStyle(p).fontSize) || 12;
          p.style.margin     = "0";
          p.style.padding    = "0";
          p.style.lineHeight = `${fs}px`; // line-height === font-size → no leading
        });
        // Force reflow so flex positions are resolved before html2canvas reads them.
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
  } catch (err) {
    console.error("Error exportando a PDF:", err);
    alert("Error al generar el PDF. Por favor, inténtelo de nuevo.");
  }
}
