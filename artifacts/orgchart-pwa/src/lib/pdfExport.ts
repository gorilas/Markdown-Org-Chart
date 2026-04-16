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

        // ── Three-pronged fix for vertical centering inside node cards ────────
        //
        // Problem: html2canvas places the FULL half-leading above each glyph
        // instead of splitting it evenly, so top padding appears larger.
        // Additionally, Tailwind's preflight margin reset for <p> may not apply
        // in the cloned document, adding default browser margins.
        //
        // Fix 1 — make every card div a flex column with justify-center so the
        //   browser (not html2canvas) does the vertical centering before capture.
        el.querySelectorAll<HTMLElement>("[data-orgcard]").forEach((card) => {
          card.style.display        = "flex";
          card.style.flexDirection  = "column";
          card.style.alignItems     = "center";
          card.style.justifyContent = "center";
        });
        //
        // Fix 2 — zero out any stray paragraph margins (browser default = 1em)
        //   that might not be reset by Tailwind preflight in the clone.
        el.querySelectorAll<HTMLElement>("p").forEach((p) => {
          p.style.margin = "0";
        });
        //
        // Fix 3 — collapse line-height to 1 so there is NO half-leading for
        //   html2canvas to misplace.  Multi-line text stays readable because the
        //   cards are narrow and lines are short.
        el.querySelectorAll<HTMLElement>("p").forEach((p) => {
          p.style.lineHeight = "1";
        });
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
