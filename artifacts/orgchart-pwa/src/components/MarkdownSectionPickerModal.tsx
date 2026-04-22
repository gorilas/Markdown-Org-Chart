interface Section {
  title: string;
  content: string;
}

interface MarkdownSectionPickerModalProps {
  sections: Section[];
  onConfirm: (content: string) => void;
  onCancel: () => void;
}

export function MarkdownSectionPickerModal({
  sections,
  onConfirm,
  onCancel,
}: MarkdownSectionPickerModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const select = form.elements.namedItem("section") as HTMLSelectElement;
    const idx = parseInt(select.value, 10);
    if (isNaN(idx) || idx < 0 || idx >= sections.length) return;
    onConfirm(sections[idx].content);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-sm shadow-xl w-full max-w-md mx-4 overflow-hidden border border-desy-border">
        <div className="bg-desy-heading px-5 py-4">
          <h2 className="text-base font-semibold text-white leading-tight">
            Seleccionar sección
          </h2>
          <p className="text-xs text-desy-blue-light mt-0.5">
            El archivo contiene varias secciones. Elige cuál cargar en el editor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="section-select"
              className="text-xs font-semibold text-desy-dark uppercase tracking-wide"
            >
              Sección raíz
            </label>
            <select
              id="section-select"
              name="section"
              className="w-full border border-desy-border rounded-sm px-3 py-2 text-sm text-desy-dark bg-white focus:outline-none focus:ring-2 focus:ring-desy-blue"
              defaultValue="0"
            >
              {sections.map((s, i) => (
                <option key={i} value={i}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold rounded-sm border border-desy-border text-desy-dark hover:bg-desy-light transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-sm bg-desy-blue text-white hover:bg-desy-blue-dark transition-colors shadow-sm"
            >
              Cargar sección
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
