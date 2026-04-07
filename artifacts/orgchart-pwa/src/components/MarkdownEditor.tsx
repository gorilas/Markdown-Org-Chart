import { useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-desy-border bg-desy-light">
        <h2 className="text-sm font-semibold text-desy-dark uppercase tracking-wide">
          Editor Markdown
        </h2>
        <p className="text-xs text-desy-muted mt-0.5">
          Edita el Markdown para actualizar el organigrama
        </p>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          flex-1 w-full p-4 resize-none outline-none
          font-mono text-sm text-desy-dark bg-white
          placeholder-desy-muted
          focus:ring-2 focus:ring-desy-blue focus:ring-inset
        "
        placeholder={`## Nombre del Organismo\nNombre del responsable\n\n### Dirección General de Ejemplo\n- Servicio A\n- Servicio B`}
        spellCheck={false}
      />
    </div>
  );
}
