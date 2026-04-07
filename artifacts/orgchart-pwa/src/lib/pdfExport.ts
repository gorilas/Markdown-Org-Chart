import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOrgChartToPdf(elementId: string, title: string = "Organigrama") {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("No se encontró el elemento del organigrama.");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const ratio = Math.min(availWidth / imgWidth, availHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    const x = margin + (availWidth - scaledWidth) / 2;
    const y = margin + (availHeight - scaledHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

    const fileName = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_organigrama.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error("Error exportando a PDF:", err);
    alert("Error al generar el PDF. Por favor, inténtelo de nuevo.");
  }
}
