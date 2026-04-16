# Organigrama desde Markdown (DESY)

Aplicación PWA para convertir Markdown estructurado en organigramas interactivos con el sistema de diseño DESY del Gobierno de Aragón.

## Funcionalidades

- Conversión de Markdown a organigrama
- Cambio de disposición horizontal/vertical por nodo
- Exportación a PDF en A4 apaisado
- Zoom automático para ajustar el árbol al viewport
- Sin backend

## Tecnologías

- React
- Vite
- TypeScript
- Tailwind CSS

## Ejecutar en local

### Requisitos
- Node.js
- pnpm

### Instalar dependencias
```bash
pnpm install
```

### Ejecutar la app
```bash
pnpm --filter @workspace/orgchart-pwa run dev
```

### Compilar para producción
```bash
pnpm --filter @workspace/orgchart-pwa run build
```

### Probar la versión de producción
```bash
pnpm --filter @workspace/orgchart-pwa run serve
```

## Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. En Vercel, pulsa **New Project** y selecciona el repositorio.
3. Configura el proyecto como aplicación Vite.
4. Usa estos valores:
   - **Build Command**: `pnpm --filter @workspace/orgchart-pwa run build`
   - **Output Directory**: `artifacts/orgchart-pwa/dist`
   - **Install Command**: `pnpm install`
5. Despliega el proyecto.

## Notas

- La carpeta `attached_assets/` está ignorada en Git.
- La aplicación no necesita backend.
