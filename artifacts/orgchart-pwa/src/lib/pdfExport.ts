import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId) as HTMLElement | null;
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  const prevZoom = element.style.zoom;
  const prevShadow = element.style.boxShadow;
  const prevRadius = element.style.borderRadius;
  const prevPadding = element.style.padding;
  const prevBg = element.style.backgroundColor;

  const toggleBtns = element.querySelectorAll<HTMLElement>("button");
  const btnPrevVis: string[] = [];
  toggleBtns.forEach((btn) => {
    btnPrevVis.push(btn.style.visibility);
    btn.style.visibility = "hidden";
  });

  const legendSquares = element.querySelectorAll<HTMLElement>(".inline-block.w-3.h-3");
  const legendPrevDisplay: string[] = [];
  legendSquares.forEach((square) => {
    legendPrevDisplay.push(square.style.display);
    square.style.display = "none";
  });

  element.style.zoom = "1";
  element.style.boxShadow = "none";
  element.style.borderRadius = "0";
  element.style.padding = "24px 32px 32px";
  element.style.backgroundColor = "#ffffff";

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (node) => node instanceof HTMLElement && node.classList.contains("group-hover:opacity-100"),
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.88);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;

    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const ratio = Math.min(availWidth / canvas.width, availHeight / canvas.height);
    const scaledWidth = canvas.width * ratio;
    const scaledHeight = canvas.height * ratio;

    const x = margin + (availWidth - scaledWidth) / 2;
    const y = margin + (availHeight - scaledHeight) / 2;

    pdf.addImage(imgData, "JPEG", x, y, scaledWidth, scaledHeight);

    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_organigrama.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error("Error exportando a PDF:", err);
    alert("Error al generar el PDF. Por favor, inténtelo de nuevo.");
  } finally {
    element.style.zoom = prevZoom;
    element.style.boxShadow = prevShadow;
    element.style.borderRadius = prevRadius;
    element.style.padding = prevPadding;
    element.style.backgroundColor = prevBg;

    toggleBtns.forEach((btn, i) => {
      btn.style.visibility = btnPrevVis[i];
    });
    legendSquares.forEach((square, i) => {
      square.style.display = legendPrevDisplay[i];
    });
  }
}
