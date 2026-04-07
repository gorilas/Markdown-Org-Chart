import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Edit3, 
  Users, 
  Briefcase, 
  Landmark, 
  Scale, 
  Zap, 
  Globe, 
  BarChart3,
  BookOpen
} from 'lucide-react';

// --- Mock Data ---
const rootDepartment = {
  title: "Departamento de Presidencia, Economía y Justicia",
  subtitle: "María del Mar Vaquero Perianez",
};

const mockDivisions = [
  {
    id: 'sgt',
    name: "Secretaría General Técnica",
    icon: Building2,
    services: [
      "Servicio de Personal",
      "Servicio de Gestión Económica",
      "Servicio de Contratación y Asuntos Generales",
      "Servicio de Régimen Jurídico"
    ]
  },
  {
    id: 'dgri',
    name: "Dirección General de Relaciones Institucionales",
    icon: Users,
    services: [
      "Servicio de Relaciones con las Cortes",
      "Servicio de Relaciones Institucionales",
      "Servicio de Protocolo"
    ]
  },
  {
    id: 'dgsj',
    name: "Dirección General de Servicios Jurídicos",
    icon: Scale,
    services: [
      "Servicio de Asesoramiento Jurídico",
      "Servicio de Representación y Defensa en Juicio",
      "Servicio de Coordinación Jurídica"
    ]
  },
  {
    id: 'dgj',
    name: "Dirección General de Justicia",
    icon: Landmark,
    services: [
      "Servicio de Infraestructuras Judiciales",
      "Servicio de Personal de Justicia",
      "Servicio de Modernización de la Justicia"
    ]
  },
  {
    id: 'dgpe',
    name: "Dirección General de Política Económica",
    icon: BarChart3,
    services: [
      "Servicio de Análisis Económico",
      "Servicio de Planificación Económica",
      "Servicio de Estudios y Publicaciones"
    ]
  },
  {
    id: 'dgt',
    name: "Dirección General de Trabajo",
    icon: Briefcase,
    services: [
      "Servicio de Relaciones Laborales",
      "Servicio de Seguridad y Salud Laboral",
      "Servicio de Conciliación y Mediación"
    ]
  },
  {
    id: 'dgpa',
    name: "Dirección General de Pymes y Autónomos",
    icon: Building2,
    services: [
      "Servicio de Apoyo a Pymes",
      "Servicio de Fomento del Emprendimiento",
      "Servicio de Financiación Empresarial"
    ]
  },
  {
    id: 'dgem',
    name: "Dirección General de Energía y Minas",
    icon: Zap,
    services: [
      "Servicio de Planificación Energética",
      "Servicio de Ordenación Minera",
      "Servicio de Transición Energética",
      "Servicio de Inspección"
    ]
  },
  {
    id: 'dgue',
    name: "Delegación del Gobierno ante la UE",
    icon: Globe,
    services: [
      "Servicio de Asuntos Europeos",
      "Servicio de Cooperación Transfronteriza"
    ]
  },
  {
    id: 'iaf',
    name: "Instituto Aragonés de Fomento (IAF)",
    icon: BarChart3,
    services: [
      "Área de Promoción Económica",
      "Área de Infraestructuras Empresariales",
      "Área de Financiación"
    ]
  },
  {
    id: 'iam',
    name: "Instituto Aragonés de la Mujer (IAM)",
    icon: Users,
    services: [
      "Servicio de Promoción de la Igualdad",
      "Servicio de Prevención de la Violencia de Género",
      "Servicio de Atención Integral"
    ]
  },
  {
    id: 'iaap',
    name: "Instituto Aragonés de Administración Pública",
    icon: BookOpen,
    services: [
      "Servicio de Formación",
      "Servicio de Selección",
      "Servicio de Estudios y Publicaciones"
    ]
  }
];

export function CardGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const filteredDivisions = useMemo(() => {
    return mockDivisions.filter(div => 
      div.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      div.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm]);

  const totalServices = mockDivisions.reduce((acc, div) => acc + div.services.length, 0);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans flex flex-col relative pb-20">
      {/* Header */}
      <header className="bg-[#00539f] text-white pt-10 pb-12 px-6 md:px-12 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight max-w-4xl">
              {rootDepartment.title}
            </h1>
            <p className="text-[#e0ebf5] text-lg font-medium flex items-center gap-2">
              <Users className="w-5 h-5 opacity-80" />
              {rootDepartment.subtitle}
            </p>
          </div>
          
          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-[#003e7a] pt-4 md:pt-0 md:pl-6">
            <div>
              <div className="text-3xl font-bold">{mockDivisions.length}</div>
              <div className="text-sm text-[#e0ebf5] uppercase tracking-wider font-semibold">Órganos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{totalServices}</div>
              <div className="text-sm text-[#e0ebf5] uppercase tracking-wider font-semibold">Servicios</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 -mt-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-[#dee2e6] p-2 flex items-center mb-8 sticky top-4 z-10">
          <div className="pl-3 pr-2 text-[#6c757d]">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por dirección general o servicio..." 
            className="w-full py-2 px-2 text-lg outline-none text-[#212529] placeholder-[#6c757d]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="px-4 text-sm font-medium text-[#00539f] hover:text-[#003e7a]"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6 text-[#6c757d] font-medium flex justify-between items-center">
          <span>Mostrando {filteredDivisions.length} resultados</span>
          <button 
            className="text-[#00539f] text-sm hover:underline"
            onClick={() => {
              const allExpanded = filteredDivisions.every(d => expandedCards[d.id]);
              const newState: Record<string, boolean> = {};
              filteredDivisions.forEach(d => {
                newState[d.id] = !allExpanded;
              });
              setExpandedCards(newState);
            }}
          >
            {filteredDivisions.every(d => expandedCards[d.id]) ? 'Colapsar todos' : 'Expandir todos'}
          </button>
        </div>

        {/* Grid */}
        {filteredDivisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDivisions.map((division) => {
              const isExpanded = expandedCards[division.id];
              const Icon = division.icon;
              
              return (
                <div 
                  key={division.id} 
                  className={`
                    bg-white rounded-lg shadow-sm border border-[#dee2e6] transition-all duration-200
                    flex flex-col
                    ${isExpanded ? 'ring-1 ring-[#00539f] shadow-md border-[#00539f]' : 'hover:shadow-md hover:border-[#b0c4d8]'}
                  `}
                  style={{ borderTopWidth: '4px', borderTopColor: '#00539f' }}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-[#f0f5fa] text-[#00539f] p-3 rounded-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="bg-[#e6f0fa] text-[#00539f] text-xs font-bold px-2.5 py-1 rounded-full border border-[#cce0f5]">
                        {division.services.length} servicios
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-[#212529] mb-4 leading-tight flex-1">
                      {division.name}
                    </h2>
                    
                    <button 
                      onClick={() => toggleCard(division.id)}
                      className="flex items-center justify-between w-full py-2 text-sm font-semibold text-[#00539f] hover:text-[#003e7a] border-t border-[#f5f7fa] mt-auto pt-4 transition-colors"
                    >
                      <span>{isExpanded ? 'Cerrar detalles' : 'Ver servicios'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="bg-[#f8f9fa] border-t border-[#dee2e6] p-5 rounded-b-lg">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-[#6c757d] mb-3">
                        Servicios dependientes
                      </h3>
                      <ul className="space-y-2.5">
                        {division.services.map((service, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-[#00539f] font-mono text-sm font-bold opacity-60 mt-0.5 min-w-[1.5rem]">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[#212529] text-sm leading-snug">
                              {service}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-[#dee2e6] border-dashed">
            <Building2 className="w-12 h-12 text-[#adb5bd] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#212529] mb-2">No se encontraron resultados</h3>
            <p className="text-[#6c757d]">No hay direcciones o servicios que coincidan con "{searchTerm}"</p>
          </div>
        )}
      </main>

      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dee2e6] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-2 md:px-8">
          <div className="text-sm font-medium text-[#6c757d] hidden md:block">
            Directorio Institucional • Gobierno de Aragón
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#dee2e6] text-[#212529] font-semibold rounded hover:bg-[#f8f9fa] transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00539f] text-white font-semibold rounded hover:bg-[#003e7a] transition-colors shadow-sm">
              <Edit3 className="w-4 h-4" />
              <span>Editar estructura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardGrid;
