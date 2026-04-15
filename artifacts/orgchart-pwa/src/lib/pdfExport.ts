import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  // ── 1. Snapshot styles we will temporarily override ────────────────────────
  const prevZoom      = element.style.zoom;
  const prevShadow    = element.style.boxShadow;
  const prevRadius    = element.style.borderRadius;
  const prevPadding   = element.style.padding;
  const prevBg        = element.style.backgroundColor;

  // ── 2. Hide interactive UI elements that must not appear in the PDF ─────────
  //    • Toggle buttons (H/V layout switchers) — opacity-0 in CSS but still
  //      rendered by html2canvas as opaque grey circles.
  const toggleBtns = element.querySelectorAll<HTMLElement>("button");
  const btnPrevVis: string[] = [];
  toggleBtns.forEach((btn) => {
    btnPrevVis.push(btn.style.visibility);
    btn.style.visibility = "hidden";
  });

  // ── 3. Clean up canvas element for a clean screenshot ──────────────────────
  element.style.zoom            = "1";
  element.style.boxShadow       = "none";
  element.style.borderRadius    = "0";
  element.style.padding         = "24px 32px 32px"; // tighter than view padding
  element.style.backgroundColor = "#ffffff";

  try {
    const canvas = await html2canvas(element, {
      // scale 1.5 is sufficient for A4 PDF at 150 dpi — avoids the 50 MB+ files
      // that scale:2 + PNG produces.
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      // Tell html2canvas the full logical size of the element so it doesn't
      // clip content that overflows the current viewport.
      windowWidth:  element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // JPEG at 0.88 quality gives excellent visual quality at a fraction of
    // PNG file size (typically 3–8× smaller for org-chart artwork).
    const imgData = canvas.toDataURL("image/jpeg", 0.88);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth  = pdf.internal.pageSize.getWidth();   // 297 mm
    const pageHeight = pdf.internal.pageSize.getHeight();  // 210 mm
    const margin = 8; // mm

    const availWidth  = pageWidth  - margin * 2;
    const availHeight = pageHeight - margin * 2;

    // Fit the chart inside the available area, preserving aspect ratio.
    const ratio        = Math.min(availWidth / canvas.width, availHeight / canvas.height);
    const scaledWidth  = canvas.width  * ratio;
    const scaledHeight = canvas.height * ratio;

    // Centre on the page.
    const x = margin + (availWidth  - scaledWidth)  / 2;
    const y = margin + (availHeight - scaledHeight) / 2;

    pdf.addImage(imgData, "JPEG", x, y, scaledWidth, scaledHeight);

    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_organigrama.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error("Error exportando a PDF:", err);
    alert("Error al generar el PDF. Por favor, inténtelo de nuevo.");
  } finally {
    // ── 4. Always restore every overridden style ──────────────────────────────
    element.style.zoom            = prevZoom;
    element.style.boxShadow       = prevShadow;
    element.style.borderRadius    = prevRadius;
    element.style.padding         = prevPadding;
    element.style.backgroundColor = prevBg;

    toggleBtns.forEach((btn, i) => {
      btn.style.visibility = btnPrevVis[i];
    });
  }
}
