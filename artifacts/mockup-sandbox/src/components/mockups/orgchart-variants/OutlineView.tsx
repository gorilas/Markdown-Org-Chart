import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Download,
  FileEdit,
  Search,
  Building2,
  Users,
  X,
  FileText
} from "lucide-react";

// Mock Data
const initialMarkdown = `## Departamento de Presidencia, Economía y Justicia
María del Mar Vaquero Perianez

### Secretaría General Técnica
- Servicio de Personal
- Servicio de Asuntos Generales
- Servicio de Gestión Económica y Contratación

### Dirección General de Relaciones Institucionales
- Servicio de Relaciones con las Cortes
- Servicio de Acción Exterior
- Servicio de Transparencia

### Dirección General de Servicios Jurídicos
- Servicio Consultivo
- Servicio Contencioso
- Servicio de Asistencia Jurídica

### Dirección General de Justicia
- Servicio de Personal de Justicia
- Servicio de Infraestructuras Judiciales
- Servicio de Modernización

### Dirección General de Política Económica
- Servicio de Planificación Económica
- Servicio de Estadística
- Servicio de Fondos Europeos

### Dirección General de Trabajo
- Servicio de Relaciones Laborales
- Servicio de Seguridad y Salud Laboral
- Servicio de Mediación

### Dirección General de Pymes y Autónomos
- Servicio de Apoyo a Pymes
- Servicio de Fomento del Emprendimiento
- Servicio de Simplificación Administrativa

### Dirección General de Energía y Minas
- Servicio de Planificación Energética
- Servicio de Ordenación Minera
- Servicio de Eficiencia Energética

### Delegación del Gobierno ante la UE
- Oficina de Representación
- Servicio de Asesoría Europea

### Instituto Aragonés de Fomento (IAF)
- Área de Financiación
- Área de Innovación
- Área de Desarrollo Territorial

### Instituto Aragonés de la Mujer (IAM)
- Servicio de Prevención de la Violencia
- Servicio de Igualdad de Oportunidades
- Servicio de Asistencia Psicológica
`;

type ServiceNode = {
  id: string;
  name: string;
};

type DivisionNode = {
  id: string;
  name: string;
  services: ServiceNode[];
};

// Simplified parser for the mockup
function parseMarkdown(md: string) {
  const lines = md.split("\n");
  let rootName = "Departamento";
  let rootSubtitle = "";
  const divisions: DivisionNode[] = [];
  let currentDivision: DivisionNode | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      rootName = line.replace("## ", "").trim();
      // look ahead for subtitle
      if (i + 1 < lines.length && !lines[i + 1].startsWith("#") && !lines[i + 1].startsWith("-") && lines[i + 1].trim()) {
        rootSubtitle = lines[i + 1].trim();
      }
    } else if (line.startsWith("### ")) {
      currentDivision = {
        id: `div-${i}`,
        name: line.replace("### ", "").trim(),
        services: [],
      };
      divisions.push(currentDivision);
    } else if (line.startsWith("- ") && currentDivision) {
      currentDivision.services.push({
        id: `srv-${i}`,
        name: line.replace("- ", "").trim(),
      });
    }
  }

  return { rootName, rootSubtitle, divisions };
}

export default function OutlineView() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { rootName, rootSubtitle, divisions } = useMemo(() => parseMarkdown(markdown), [markdown]);

  const filteredDivisions = useMemo(() => {
    if (!searchQuery.trim()) return divisions;
    const q = searchQuery.toLowerCase();
    return divisions.filter(
      (div) =>
        div.name.toLowerCase().includes(q) ||
        div.services.some((srv) => srv.name.toLowerCase().includes(q))
    );
  }, [divisions, searchQuery]);

  const toggleDivision = (id: string) => {
    const next = new Set(expandedDivisions);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedDivisions(next);
  };

  const expandAll = () => {
    setExpandedDivisions(new Set(divisions.map(d => d.id)));
  };

  const collapseAll = () => {
    setExpandedDivisions(new Set());
  };

  // Institutional colors:
  // Primary: #00539f
  // Dark: #003e7a
  // Light gray bg: #f5f7fa
  // Border: #dee2e6

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-['Open_Sans',sans-serif] text-[#212529]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#dee2e6] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00539f] rounded text-white flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <h1 className="text-xl font-bold text-[#00539f]">Organigrama Aragon</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00539f] bg-white border border-[#00539f] rounded hover:bg-[#f0f4f8] transition-colors"
              >
                <FileEdit size={16} />
                Editar Markdown
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#00539f] rounded hover:bg-[#003e7a] transition-colors">
                <Download size={16} />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Root Node Header */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-6 mb-8 border-l-4 border-l-[#00539f]">
          <h2 className="text-2xl font-bold text-[#212529] mb-2">{rootName}</h2>
          {rootSubtitle && (
            <p className="text-[#6c757d] text-lg flex items-center gap-2">
              <Users size={18} />
              {rootSubtitle}
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-[#6c757d]" />
            </div>
            <input
              type="text"
              placeholder="Buscar dirección o servicio..."
              className="block w-full pl-10 pr-3 py-2 border border-[#dee2e6] rounded-md leading-5 bg-white placeholder-[#6c757d] focus:outline-none focus:ring-1 focus:ring-[#00539f] focus:border-[#00539f] sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={expandAll}
              className="text-sm font-medium text-[#00539f] hover:underline px-2 py-1"
            >
              Expandir todo
            </button>
            <span className="text-[#dee2e6]">|</span>
            <button 
              onClick={collapseAll}
              className="text-sm font-medium text-[#00539f] hover:underline px-2 py-1"
            >
              Contraer todo
            </button>
          </div>
        </div>

        {/* Outline List */}
        <div className="bg-white border border-[#dee2e6] rounded-lg shadow-sm overflow-hidden">
          {filteredDivisions.length === 0 ? (
            <div className="p-8 text-center text-[#6c757d]">
              No se encontraron resultados para "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y divide-[#dee2e6]">
              {filteredDivisions.map((division) => {
                const isExpanded = expandedDivisions.has(division.id);
                return (
                  <div key={division.id} className="group">
                    {/* Division Row */}
                    <button
                      onClick={() => toggleDivision(division.id)}
                      className={\`w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f7fa] transition-colors text-left \${
                        isExpanded ? "bg-[#f5f7fa] border-l-4 border-l-[#00539f] pl-3" : "border-l-4 border-l-transparent pl-3"
                      }\`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#6c757d]">
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </span>
                        <span className="font-semibold text-[15px]">{division.name}</span>
                      </div>
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#eef2f7] text-[#00539f] border border-[#d0dbe7]">
                        {division.services.length} servicios
                      </span>
                    </button>

                    {/* Services Children */}
                    {isExpanded && (
                      <div className="bg-white pb-3 pt-1">
                        {division.services.length > 0 ? (
                          <ul className="space-y-1">
                            {division.services.map((service) => (
                              <li key={service.id} className="flex items-start gap-3 pl-12 pr-4 py-1.5 hover:bg-[#f8f9fa] group/item">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#adb5bd] group-hover/item:bg-[#00539f] shrink-0" />
                                <span className="text-[14px] text-[#495057]">{service.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="pl-12 pr-4 py-2 text-[14px] text-[#adb5bd] italic">
                            No hay servicios subordinados
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Markdown Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-lg w-full flex bg-white shadow-2xl flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#dee2e6]">
              <div className="flex items-center gap-2 text-[#00539f] font-semibold text-lg">
                <FileText size={20} />
                <h3>Editar Datos (Markdown)</h3>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="text-[#6c757d] hover:text-[#212529] p-1 hover:bg-[#f5f7fa] rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-[#f8f9fa]">
              <p className="text-sm text-[#6c757d] mb-4">
                Utiliza <code>##</code> para el departamento raíz, <code>###</code> para direcciones/divisiones, y <code>-</code> para servicios.
              </p>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[calc(100%-3rem)] p-4 font-mono text-sm border border-[#dee2e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00539f] resize-none"
                spellCheck={false}
              />
            </div>
            <div className="px-6 py-4 border-t border-[#dee2e6] bg-white flex justify-end">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2 bg-[#00539f] text-white font-medium rounded hover:bg-[#003e7a] transition-colors"
              >
                Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
