import { useRef } from "react";
import { Upload } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onImportFile?: (file: File) => void;
}

export function MarkdownEditor({ value, onChange, onImportFile }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportFile) {
      onImportFile(file);
    }
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-desy-border bg-desy-light flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-desy-dark uppercase tracking-wide">
            Editor Markdown
          </h2>
          <p className="text-xs text-desy-muted mt-0.5">
            Edita el Markdown para actualizar el organigrama
          </p>
        </div>
        <div className="flex-shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-sm border border-desy-border text-desy-blue bg-white hover:bg-desy-light transition-colors shadow-sm"
            title="Importar archivo Markdown"
          >
            <Upload size={12} />
            <span>Importar</span>
          </button>
        </div>
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
