import { useState } from "react";
import { Bot, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const LLM_PROMPT = `Genera un organigrama en formato Markdown siguiendo estrictamente estas reglas:

1. La primera línea debe ser un encabezado de nivel 2 (##) con el nombre del departamento u organismo principal.
2. Opcionalmente, la segunda línea puede contener el nombre de la persona responsable (sin ningún símbolo especial, solo el nombre).
3. Cada unidad, dirección general o subdirección debe ir como encabezado de nivel 3 (###).
4. Cada servicio, sección u órgano dependiente de una unidad debe ir como elemento de lista con guion (-) justo debajo de su ### correspondiente.
5. No uses ningún otro nivel de encabezado (# o ####, etc.).
6. No añadas texto explicativo, introducción ni conclusión. Devuelve únicamente el bloque Markdown.

Ejemplo del formato esperado:

## Departamento de Medio Ambiente
María García López

### Secretaría General Técnica
- Servicio de Asuntos Generales
- Servicio de Régimen Económico

### Dirección General de Calidad Ambiental
- Servicio de Prevención y Control de la Contaminación
- Servicio de Cambio Climático

### Dirección General de Biodiversidad
- Servicio de Espacios Naturales Protegidos
- Servicio de Caza y Pesca

---

Ahora genera el organigrama para el siguiente organismo o departamento:
[DESCRIBE AQUÍ EL ORGANISMO, DEPARTAMENTO O ESTRUCTURA QUE QUIERES REPRESENTAR]`;

export function LLMPromptHelper() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = LLM_PROMPT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border-t border-desy-border bg-desy-light">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-desy-blue hover:bg-desy-blue-light transition-colors"
      >
        <span className="flex items-center gap-2">
          <Bot size={15} />
          Generar con IA
        </span>
        {open ? <ChevronUp size={14} className="text-desy-muted" /> : <ChevronDown size={14} className="text-desy-muted" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-desy-text leading-relaxed">
            Copia el prompt, pégalo en un asistente de IA (ChatGPT, Claude, Gemini…), describe el organismo que quieres representar y copia el Markdown resultante en el editor.
          </p>

          <ol className="text-xs text-desy-muted space-y-1 list-decimal list-inside leading-relaxed">
            <li>Pulsa <strong className="text-desy-dark">Copiar prompt</strong></li>
            <li>Pégalo en tu asistente de IA favorito</li>
            <li>Sustituye el texto entre corchetes por tu descripción</li>
            <li>Copia el Markdown que te devuelva y pégalo en el editor</li>
          </ol>

          <div className="relative">
            <pre className="text-xs font-mono text-desy-dark bg-white border border-desy-border rounded-sm p-3 overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed">
              {LLM_PROMPT}
            </pre>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-sm transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "bg-desy-blue text-white hover:bg-desy-blue-dark"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copiar prompt
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
