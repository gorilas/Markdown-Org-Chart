import { useState, useCallback } from "react";
import { OrgNode, parseMarkdownToTree, toggleNodeLayout } from "@/lib/markdownParser";
import { exportOrgChartToPdf } from "@/lib/pdfExport";
import { OrgChart } from "@/components/OrgChart";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { LLMPromptHelper } from "@/components/LLMPromptHelper";
import { FileDown, ChevronLeft, ChevronRight, Info } from "lucide-react";

const DEFAULT_MARKDOWN = `## Departamento de Presidencia, Economía y Justicia
María del Mar Vaquero Perianez

### Secretaría General Técnica del Departamento de Presidencia, Economía y Justicia
- Servicio de Régimen Jurídico, Asuntos Generales y Coordinación Administrativa
- Servicio de Personal, Régimen Jurídico y Asuntos Generales
- Servicio de Régimen Económico y Contratación
- Servicio del Boletín Oficial de Aragón y Registro de Convenios
- Unidad de Protocolo
- Dirección de Comunicación

### Dirección General de Relaciones Institucionales, Acción Exterior y Transparencia
- Servicio de Relaciones Institucionales y con las Cortes de Aragón
- Servicio de Acción Exterior
- Servicio de Participación Ciudadana e Innovación Social
- Servicio de Transparencia

### Dirección General de Servicios Jurídicos

### Dirección General de Desarrollo Estatutario
- Servicio de Desarrollo Estatutario

### Dirección General de Justicia
- Servicio de Administración General
- Servicio de Personal
- Servicio de Tecnologías de la Información de Justicia
- Servicio de Infraestructuras de Justicia

### Dirección General de Política Económica
- Servicio de Promoción Económica
- Servicio de Competencia y Regulación
- Servicio de Estudios y Asesoramiento Económico
- Servicio de Planificación para el Desarrollo Económico
- Instituto Aragonés de Estadística (IAEST)

### Dirección General de Trabajo
- Servicio de Relaciones Laborales
- Subdirección Provincial de Trabajo de Huesca
- Subdirección Provincial de Trabajo de Teruel
- Subdirección Provincial de Trabajo de Zaragoza
- Instituto Aragonés de Seguridad y Salud Laboral (ISSLA)

### Dirección General de Pymes y Autónomos
- Servicio de Fomento y Apoyo a las Pymes y los Autónomos

### Dirección General de Promoción Industrial e Innovación
- Servicio de Fomento Industrial e Impulso a la Innovación
- Servicio de Metrología, Seguridad y Calidad Industrial

### Dirección General de Comercio, Ferias y Artesanía
- Servicio de Ordenación y Promoción Comercial
- Servicio de Comercio Exterior, Ferias y Artesanía

### Dirección General de Energía y Minas
- Servicio de Gestión Energética
- Servicio de Planificación Energética
- Servicio de Promoción y Desarrollo Minero

### Dirección General de Protección de Consumidores y Usuarios
- Servicio del Consumidor
- Servicio de Normativa Supervisión de Mercado

### Delegación del Gobierno de Aragón ante la Unión Europea

### Servicio Provincial de Presidencia, Economía y Justicia de Huesca

### Servicio Provincial de Presidencia, Economía y Justicia de Teruel

### Servicio Provincial de Presidencia, Economía y Justicia de Zaragoza

### Instituto Aragonés de Fomento (IAF)

### Instituto Aragonés de la Mujer (IAM)
- Secretaría general del Instituto Aragonés de la Mujer

### Instituto Tecnológico de Aragón (ITA)

### Corporación Aragonesa de Radio y Televisión (CARTV)

### Consejo de Industria de Aragón

### Comisión Aragonesa de Derecho Civil`;

export function OrgChartApp() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [tree, setTree] = useState<OrgNode | null>(() => parseMarkdownToTree(DEFAULT_MARKDOWN));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleMarkdownChange = useCallback((val: string) => {
    setMarkdown(val);
    setTree(parseMarkdownToTree(val));
  }, []);

  const handleToggleLayout = useCallback((id: string) => {
    if (!tree) return;
    setTree((prev) => (prev ? toggleNodeLayout(prev, id) : null));
  }, [tree]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportOrgChartToPdf("orgchart-canvas", tree?.label || "organigrama");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-desy-page font-desy">
      {/* Header */}
      <header className="bg-desy-heading text-white flex-shrink-0 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white uppercase tracking-widest">
                Gobierno de Aragón
              </span>
              <h1 className="text-lg font-bold leading-tight text-white">
                Generador de Organigramas
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-sm border border-desy-border text-desy-blue-light hover:bg-desy-heading transition-colors"
            >
              <Info size={14} />
              <span className="hidden sm:inline">Ayuda</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={!tree || exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-sm bg-white text-desy-blue hover:bg-desy-blue-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FileDown size={14} />
              {exporting ? "Generando..." : "Descargar PDF"}
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="border-t border-desy-heading bg-desy-heading-dark px-4 py-3 text-sm text-desy-blue-light">
            <p className="font-semibold text-white mb-1">Cómo usar esta herramienta:</p>
            <ul className="space-y-1 text-xs list-disc list-inside text-desy-muted">
              <li>Escribe o pega Markdown con niveles <code className="bg-desy-heading px-1 rounded">##</code> (organismo), <code className="bg-desy-heading px-1 rounded">###</code> (unidades) y <code className="bg-desy-heading px-1 rounded">-</code> (servicios)</li>
              <li>Pasa el ratón sobre un nodo y pulsa el botón de layout para cambiar entre horizontal y vertical</li>
              <li>El layout de cada nodo se guarda automáticamente en el navegador</li>
              <li>Usa "Descargar PDF" para exportar el organigrama en A4 horizontal</li>
            </ul>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 bg-desy-blue text-white p-1 rounded-r-sm shadow-md hidden sm:flex items-center"
          style={{ left: sidebarOpen ? "320px" : "0" }}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Sidebar - Markdown editor */}
        <div
          className={`
            flex-shrink-0 border-r border-desy-border bg-white flex flex-col overflow-hidden
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-80" : "w-0"}
          `}
        >
          {sidebarOpen && (
            <>
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
              </div>
              <LLMPromptHelper />
            </>
          )}
        </div>

        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex-shrink-0 flex items-center justify-center w-6 bg-desy-light border-r border-desy-border hover:bg-gray-200 transition-colors cursor-pointer"
          title={sidebarOpen ? "Cerrar editor" : "Abrir editor"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={14} className="text-desy-muted" />
          ) : (
            <ChevronRight size={14} className="text-desy-muted" />
          )}
        </button>

        {/* Org chart canvas */}
        <div className="flex-1 overflow-auto bg-desy-page">
          {!tree ? (
            <div className="flex flex-col items-center justify-center h-full text-desy-muted">
              <p className="text-sm">El Markdown no tiene una estructura válida.</p>
              <p className="text-xs mt-1">
                Usa <code className="bg-gray-100 px-1 rounded">## Título</code> como nodo raíz.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <OrgChart root={tree} onToggleLayout={handleToggleLayout} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
