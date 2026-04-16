import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  await document.fonts.ready;

  const prevZoom = element.style.zoom;
  element.style.zoom = "1";
  void element.getBoundingClientRect();

  const naturalWidth  = element.scrollWidth;
  const naturalHeight = element.scrollHeight;

  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.92,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      style: {
        zoom: "1",
        boxShadow: "none",
        borderRadius: "0",
        padding: "24px 32px 32px",
      },
      filter: (node) => {
        if (node instanceof HTMLElement && node.tagName === "BUTTON") return false;
        return true;
      },
    });

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

    const ratio        = Math.min(availWidth / naturalWidth, availHeight / naturalHeight);
    const scaledWidth  = naturalWidth  * ratio;
    const scaledHeight = naturalHeight * ratio;

    const x = margin + (availWidth  - scaledWidth)  / 2;
    const y = margin + (availHeight - scaledHeight) / 2;

    pdf.addImage(dataUrl, "JPEG", x, y, scaledWidth, scaledHeight);

    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_organigrama.pdf`;
    pdf.save(fileName);
  } finally {
    element.style.zoom = prevZoom;
  }
}
