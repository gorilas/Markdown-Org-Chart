import React, { useState } from "react";
import { ChevronRight, ChevronLeft, ArrowLeft, Users, Building, FileText, Map } from "lucide-react";

// --- Mock Data ---
const departmentData = {
  id: "root",
  name: "Departamento de Presidencia, Economía y Justicia",
  subtitle: "María del Mar Vaquero Perianez",
  divisions: [
    {
      id: "d1",
      name: "Secretaría General Técnica",
      services: ["Servicio de Personal", "Servicio de Asuntos Jurídicos", "Servicio de Gestión Económica"],
    },
    {
      id: "d2",
      name: "Dirección General de Relaciones Institucionales",
      services: ["Servicio de Relaciones con las Cortes", "Servicio de Protocolo", "Servicio de Acción Exterior"],
    },
    {
      id: "d3",
      name: "Dirección General de Servicios Jurídicos",
      services: ["Servicio Contencioso", "Servicio Consultivo", "Coordinación Jurídica"],
    },
    {
      id: "d4",
      name: "Dirección General de Justicia",
      services: ["Servicio de Infraestructuras Judiciales", "Servicio de Personal de Justicia", "Instituto de Medicina Legal"],
    },
    {
      id: "d5",
      name: "Dirección General de Política Económica",
      services: ["Servicio de Estudios Económicos", "Servicio de Planificación", "Servicio de Defensa de la Competencia"],
    },
    {
      id: "d6",
      name: "Dirección General de Trabajo",
      services: ["Servicio de Relaciones Laborales", "Servicio de Seguridad y Salud Laboral", "Instituto Aragonés de Seguridad y Salud Laboral (ISSLA)"],
    },
    {
      id: "d7",
      name: "Dirección General de Pymes y Autónomos",
      services: ["Servicio de Apoyo a Pymes", "Servicio de Emprendimiento", "Servicio de Financiación Empresarial"],
    },
    {
      id: "d8",
      name: "Dirección General de Energía y Minas",
      services: ["Servicio de Planificación Energética", "Servicio de Promoción Minera", "Servicio de Inspección y Seguridad"],
    },
    {
      id: "d9",
      name: "Delegación del Gobierno ante la UE",
      services: ["Oficina de Aragón en Bruselas", "Servicio de Asuntos Europeos"],
    },
    {
      id: "d10",
      name: "Instituto Aragonés de Fomento (IAF)",
      services: ["Área de Innovación", "Área de Infraestructuras", "Área de Inversiones"],
    },
    {
      id: "d11",
      name: "Instituto Aragonés de la Mujer (IAM)",
      services: ["Servicio de Programas Transversales", "Servicio de Atención a la Mujer", "Observatorio Aragonés de Violencia contra la Mujer"],
    },
    {
      id: "d12",
      name: "Tribunal Administrativo de Contratos Públicos",
      services: ["Secretaría del Tribunal", "Área de Resoluciones"],
    },
  ],
};

export default function FocusTree() {
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState<number | null>(null);

  const selectedDivision = selectedDivisionIndex !== null ? departmentData.divisions[selectedDivisionIndex] : null;

  const handleNext = () => {
    if (selectedDivisionIndex !== null && selectedDivisionIndex < departmentData.divisions.length - 1) {
      setSelectedDivisionIndex(selectedDivisionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedDivisionIndex !== null && selectedDivisionIndex > 0) {
      setSelectedDivisionIndex(selectedDivisionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#001a3a] text-white font-sans overflow-hidden flex flex-col relative transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#00274d] to-transparent pointer-events-none opacity-50" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00539f] rounded-full blur-[120px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-8 h-[100dvh]">
        
        {/* --- STATE 1: ROOT VIEW --- */}
        <div 
          className={`flex flex-col h-full transition-all duration-500 ease-in-out absolute inset-0 p-6 sm:p-10 ${
            selectedDivisionIndex === null 
              ? "opacity-100 translate-x-0 visible" 
              : "opacity-0 -translate-x-20 invisible pointer-events-none"
          }`}
        >
          {/* Header */}
          <header className="mb-12 border-b border-[#00539f]/30 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00539f]/20 text-[#60a5fa] text-sm font-semibold mb-6 border border-[#00539f]/50">
              <Building className="w-4 h-4" />
              <span>Nivel Departamental</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              {departmentData.name}
            </h1>
            <p className="text-xl text-[#93c5fd] font-light flex items-center gap-3">
              <Users className="w-5 h-5 opacity-70" />
              Titular: <span className="font-medium text-white">{departmentData.subtitle}</span>
            </p>
          </header>

          {/* Grid of Divisions */}
          <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar pr-4">
            <h2 className="text-lg font-medium text-[#60a5fa] mb-6 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Direcciones y Organismos ({departmentData.divisions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {departmentData.divisions.map((div, idx) => (
                <button
                  key={div.id}
                  onClick={() => setSelectedDivisionIndex(idx)}
                  className="group relative text-left bg-[#00274d] border border-[#00539f]/40 rounded-xl p-6 hover:bg-[#00539f] hover:border-[#60a5fa]/50 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(0,83,159,0.4)] flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00539f] group-hover:bg-[#60a5fa] transition-colors" />
                  
                  <h3 className="text-lg font-semibold text-white mb-auto leading-snug group-hover:translate-x-1 transition-transform">
                    {div.name}
                  </h3>
                  
                  <div className="mt-6 flex items-center justify-between text-sm text-[#93c5fd] group-hover:text-white/90">
                    <span className="flex items-center gap-1.5 bg-[#001a3a] px-2.5 py-1 rounded-md group-hover:bg-black/20">
                      <FileText className="w-3.5 h-3.5" />
                      {div.services.length} servicios
                    </span>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- STATE 2: DETAIL VIEW --- */}
        <div 
          className={`flex flex-col h-full transition-all duration-500 ease-in-out absolute inset-0 ${
            selectedDivisionIndex !== null 
              ? "opacity-100 translate-x-0 visible" 
              : "opacity-0 translate-x-20 invisible pointer-events-none"
          }`}
        >
          {selectedDivision && (
            <div className="flex-1 flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden mt-0 sm:mt-6 sm:mb-6 sm:mx-6 border border-[#00539f]/20">
              
              {/* Detail Header (Blue) */}
              <div className="bg-[#00539f] p-6 sm:p-10 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                {/* Breadcrumb / Top Bar */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <button 
                    onClick={() => setSelectedDivisionIndex(null)}
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 px-4 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Departamento
                  </button>
                  
                  <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#93c5fd]">
                    <span className="opacity-60">{departmentData.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                    <span className="text-white">Dirección</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-[#93c5fd] text-sm font-bold tracking-wider uppercase mb-3">
                    Dirección General / Organismo
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight max-w-4xl">
                    {selectedDivision.name}
                  </h2>
                </div>
              </div>

              {/* Detail Content (White) */}
              <div className="flex-1 bg-[#f5f7fa] p-6 sm:p-10 overflow-y-auto relative text-[#212529]">
                <div className="max-w-4xl mx-auto">
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#00539f]/10 flex items-center justify-center text-[#00539f]">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-[#003e7a]">
                      Estructura de Servicios ({selectedDivision.services.length})
                    </h3>
                  </div>

                  {selectedDivision.services.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDivision.services.map((service, idx) => (
                        <div 
                          key={idx}
                          className="group bg-white border border-[#dee2e6] rounded-xl p-5 flex items-center gap-4 hover:border-[#00539f]/30 hover:shadow-md transition-all"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#f5f7fa] flex items-center justify-center text-[#6c757d] font-bold text-sm group-hover:bg-[#00539f] group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#212529] group-hover:text-[#00539f] transition-colors">
                              {service}
                            </h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#dee2e6]">
                      <FileText className="w-12 h-12 text-[#dee2e6] mx-auto mb-3" />
                      <p className="text-[#6c757d] font-medium">No hay servicios registrados en esta dirección.</p>
                    </div>
                  )}

                </div>
              </div>
              
              {/* Navigation Footer */}
              <div className="bg-white border-t border-[#dee2e6] p-4 flex items-center justify-between shrink-0">
                <button 
                  onClick={handlePrev}
                  disabled={selectedDivisionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-[#00539f] font-medium hover:bg-[#f5f7fa] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Dirección Anterior</span>
                  <span className="sm:hidden">Anterior</span>
                </button>
                
                <div className="text-sm text-[#6c757d] font-medium">
                  {selectedDivisionIndex !== null ? selectedDivisionIndex + 1 : 0} / {departmentData.divisions.length}
                </div>
                
                <button 
                  onClick={handleNext}
                  disabled={selectedDivisionIndex === departmentData.divisions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-[#00539f] font-medium hover:bg-[#f5f7fa] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <span className="hidden sm:inline">Siguiente Dirección</span>
                  <span className="sm:hidden">Siguiente</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 39, 77, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 83, 159, 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.8);
        }
      `}</style>
    </div>
  );
}
