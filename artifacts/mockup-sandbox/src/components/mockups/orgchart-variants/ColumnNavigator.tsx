import React, { useState } from 'react';
import { ChevronRight, Building2, Users, FileText, ArrowLeft, Maximize2, Download, Search } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  head?: string;
}

interface Division {
  id: string;
  name: string;
  head?: string;
  services: Service[];
}

interface Root {
  id: string;
  name: string;
  head: string;
  divisions: Division[];
}

const ORG_DATA: Root = {
  id: "root-1",
  name: "Departamento de Presidencia, Economía y Justicia",
  head: "María del Mar Vaquero Perianez",
  divisions: [
    {
      id: "div-1",
      name: "Secretaría General Técnica",
      services: [
        { id: "srv-1-1", name: "Servicio de Personal" },
        { id: "srv-1-2", name: "Servicio de Gestión Económica" },
        { id: "srv-1-3", name: "Servicio de Régimen Jurídico" },
        { id: "srv-1-4", name: "Servicio de Asuntos Generales" }
      ]
    },
    {
      id: "div-2",
      name: "Dirección General de Relaciones Institucionales",
      services: [
        { id: "srv-2-1", name: "Servicio de Relaciones con las Cortes" },
        { id: "srv-2-2", name: "Servicio de Coordinación Normativa" }
      ]
    },
    {
      id: "div-3",
      name: "Dirección General de Servicios Jurídicos",
      services: [
        { id: "srv-3-1", name: "Servicio Contencioso" },
        { id: "srv-3-2", name: "Servicio Consultivo" },
        { id: "srv-3-3", name: "Servicio de Asistencia Jurídica a Entes Públicos" }
      ]
    },
    {
      id: "div-4",
      name: "Dirección General de Justicia",
      services: [
        { id: "srv-4-1", name: "Servicio de Infraestructuras Judiciales" },
        { id: "srv-4-2", name: "Servicio de Personal de Administración de Justicia" },
        { id: "srv-4-3", name: "Servicio de Relaciones con la Administración de Justicia" }
      ]
    },
    {
      id: "div-5",
      name: "Dirección General de Política Económica",
      services: [
        { id: "srv-5-1", name: "Servicio de Análisis Macroeconómico" },
        { id: "srv-5-2", name: "Servicio de Planificación Económica" }
      ]
    },
    {
      id: "div-6",
      name: "Dirección General de Trabajo",
      services: [
        { id: "srv-6-1", name: "Servicio de Relaciones Laborales" },
        { id: "srv-6-2", name: "Servicio de Seguridad y Salud Laboral" },
        { id: "srv-6-3", name: "Servicio de Conciliación y Mediación" }
      ]
    },
    {
      id: "div-7",
      name: "Dirección General de Pymes y Autónomos",
      services: [
        { id: "srv-7-1", name: "Servicio de Apoyo a Pymes" },
        { id: "srv-7-2", name: "Servicio de Fomento del Trabajo Autónomo" }
      ]
    },
    {
      id: "div-8",
      name: "Dirección General de Energía y Minas",
      services: [
        { id: "srv-8-1", name: "Servicio de Planificación Energética" },
        { id: "srv-8-2", name: "Servicio de Ordenación Minera" },
        { id: "srv-8-3", name: "Servicio de Inspección y Seguridad" }
      ]
    },
    {
      id: "div-9",
      name: "Delegación del Gobierno ante la UE",
      services: [
        { id: "srv-9-1", name: "Servicio de Asuntos Europeos" },
        { id: "srv-9-2", name: "Oficina de Aragón en Bruselas" }
      ]
    },
    {
      id: "div-10",
      name: "Instituto Aragonés de Fomento (IAF)",
      services: [
        { id: "srv-10-1", name: "Área de Promoción Industrial" },
        { id: "srv-10-2", name: "Área de Innovación" },
        { id: "srv-10-3", name: "Área de Emprendimiento" }
      ]
    },
    {
      id: "div-11",
      name: "Instituto Aragonés de la Mujer (IAM)",
      services: [
        { id: "srv-11-1", name: "Servicio de Programas y Actuaciones" },
        { id: "srv-11-2", name: "Servicio de Atención a la Violencia contra la Mujer" }
      ]
    },
    {
      id: "div-12",
      name: "Instituto Aragonés de la Juventud (IAJ)",
      services: [
        { id: "srv-12-1", name: "Servicio de Programas para Jóvenes" },
        { id: "srv-12-2", name: "Instalaciones Juveniles" }
      ]
    },
    {
      id: "div-13",
      name: "Tribunal de Defensa de la Competencia de Aragón",
      services: [
        { id: "srv-13-1", name: "Servicio de Instrucción" },
        { id: "srv-13-2", name: "Secretaría del Tribunal" }
      ]
    },
    {
      id: "div-14",
      name: "Consejo Aragonés de Relaciones Laborales",
      services: []
    },
    {
      id: "div-15",
      name: "Jurado Interdisciplinar de Valoración",
      services: []
    }
  ]
};

export function ColumnNavigator() {
  const [selectedDivId, setSelectedDivId] = useState<string | null>(null);
  
  const selectedDivision = ORG_DATA.divisions.find(d => d.id === selectedDivId);

  const totalDivisions = ORG_DATA.divisions.length;
  const totalServices = ORG_DATA.divisions.reduce((acc, curr) => acc + curr.services.length, 0);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f5f7fa] font-['Open_Sans',sans-serif] text-[#212529] overflow-hidden">
      {/* Top Navigation Bar - Institutional feel */}
      <header className="flex-none bg-[#00539f] text-white px-6 py-4 shadow-md z-10">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{ORG_DATA.name}</h1>
              <p className="text-sm text-blue-100 mt-0.5">{ORG_DATA.head}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors" title="Buscar">
              <Search size={20} />
            </button>
            <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors" title="Exportar PDF">
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb / Status Bar */}
      <div className="flex-none bg-white border-b border-[#dee2e6] px-6 py-3 text-sm text-[#6c757d] shadow-sm z-0 relative">
        <div className="max-w-7xl mx-auto w-full flex items-center">
          <span className="font-semibold text-[#00539f]">Gobierno de Aragón</span>
          <ChevronRight size={16} className="mx-2 text-[#dee2e6]" />
          <span>{ORG_DATA.name}</span>
          {selectedDivision && (
            <>
              <ChevronRight size={16} className="mx-2 text-[#dee2e6]" />
              <span className="text-[#212529] font-medium">{selectedDivision.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Column Layout */}
      <main className="flex-1 flex overflow-hidden p-6 max-w-7xl mx-auto w-full gap-6">
        
        {/* Column 1: Divisions */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#dee2e6] shadow-sm overflow-hidden">
          <div className="flex-none px-5 py-4 border-b border-[#dee2e6] bg-[#f8f9fa] flex justify-between items-center">
            <h2 className="font-bold text-[#003e7a] text-sm uppercase tracking-wider flex items-center">
              <Users size={16} className="mr-2" />
              Direcciones Generales
            </h2>
            <span className="bg-[#e9ecef] text-[#495057] text-xs font-bold px-2 py-1 rounded-full">
              {totalDivisions}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {ORG_DATA.divisions.map((division) => {
                const isSelected = selectedDivId === division.id;
                return (
                  <button
                    key={division.id}
                    onClick={() => setSelectedDivId(division.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center justify-between group transition-colors duration-150 ${
                      isSelected 
                        ? 'bg-[#00539f] text-white shadow-md' 
                        : 'hover:bg-[#f1f3f5] text-[#212529]'
                    }`}
                  >
                    <span className={`font-medium text-sm pr-4 line-clamp-2 ${isSelected ? 'text-white' : ''}`}>
                      {division.name}
                    </span>
                    <div className="flex items-center flex-none">
                      {division.services.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#e9ecef] text-[#6c757d]'
                        }`}>
                          {division.services.length}
                        </span>
                      )}
                      <ChevronRight 
                        size={18} 
                        className={`${isSelected ? 'text-white' : 'text-[#adb5bd] group-hover:text-[#00539f]'}`} 
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Services */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#dee2e6] shadow-sm overflow-hidden relative">
          {!selectedDivision ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6c757d] bg-[#f8f9fa] p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#e9ecef] flex items-center justify-center mb-4 text-[#adb5bd]">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[#495057] mb-2">Ninguna dirección seleccionada</h3>
              <p className="text-sm max-w-[250px]">
                Selecciona una dirección general en la columna izquierda para ver sus servicios asociados.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-none px-5 py-4 border-b border-[#dee2e6] bg-[#f8f9fa] flex justify-between items-center">
                <h2 className="font-bold text-[#003e7a] text-sm uppercase tracking-wider flex items-center">
                  <FileText size={16} className="mr-2" />
                  Servicios
                </h2>
                <span className="bg-[#e9ecef] text-[#495057] text-xs font-bold px-2 py-1 rounded-full">
                  {selectedDivision.services.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white p-4">
                <div className="mb-6 p-4 bg-[#f8f9fa] rounded-lg border border-[#e9ecef]">
                  <h3 className="text-[#00539f] font-bold text-lg leading-tight mb-1">
                    {selectedDivision.name}
                  </h3>
                  <p className="text-sm text-[#6c757d] flex items-center">
                    <Building2 size={14} className="mr-1.5" />
                    Nivel 2 de la estructura orgánica
                  </p>
                </div>

                {selectedDivision.services.length === 0 ? (
                  <div className="text-center py-10 text-[#6c757d]">
                    <p>No hay servicios registrados para esta dirección.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDivision.services.map((service, index) => (
                      <div 
                        key={service.id}
                        className="p-4 border border-[#dee2e6] rounded-lg hover:border-[#00539f]/30 hover:shadow-sm transition-all bg-white flex items-start group"
                      >
                        <div className="w-8 h-8 rounded bg-[#e9ecef] text-[#6c757d] group-hover:bg-[#00539f]/10 group-hover:text-[#00539f] flex items-center justify-center font-bold text-sm mr-4 flex-none transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#212529] leading-tight mb-1 group-hover:text-[#00539f] transition-colors">
                            {service.name}
                          </h4>
                          <span className="inline-flex items-center text-xs text-[#6c757d] bg-[#f8f9fa] px-2 py-0.5 rounded border border-[#e9ecef]">
                            Nivel 3
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Footer Metadata */}
      <footer className="flex-none bg-white border-t border-[#dee2e6] px-6 py-2 text-xs text-[#6c757d] flex justify-between items-center z-10 relative shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <div>
          Datos actualizados: Estructura 2024
        </div>
        <div className="flex space-x-6">
          <span className="flex items-center"><Building2 size={14} className="mr-1.5" /> 1 Departamento</span>
          <span className="flex items-center"><Users size={14} className="mr-1.5" /> {totalDivisions} Direcciones</span>
          <span className="flex items-center"><FileText size={14} className="mr-1.5" /> {totalServices} Servicios</span>
        </div>
      </footer>
    </div>
  );
}

export default ColumnNavigator;