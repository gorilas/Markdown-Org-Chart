export interface OrgNode {
  id: string;
  label: string;
  subtitle?: string;
  level: number;
  children: OrgNode[];
  layout: "horizontal" | "vertical";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function makeNodeId(path: string[]): string {
  const full = path.map(slugify).join("__");
  if (full.length <= 80) return full;
  return full.slice(0, 60) + "__" + hashStr(full);
}

function getStoredLayout(id: string): "horizontal" | "vertical" {
  try {
    const stored = localStorage.getItem(`layout-${id}`);
    if (stored === "horizontal" || stored === "vertical") return stored;
  } catch {
  }
  return "horizontal";
}

export function parseMarkdownToTree(markdown: string): OrgNode | null {
  const lines = markdown.split("\n");

  const h2Blocks: {
    heading: string;
    subtitle: string;
    h3Blocks: { heading: string; items: string[] }[];
  }[] = [];
  let currentH2: (typeof h2Blocks)[0] | null = null;
  let currentH3: { heading: string; items: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      currentH2 = { heading: trimmed.slice(3).trim(), subtitle: "", h3Blocks: [] };
      h2Blocks.push(currentH2);
      currentH3 = null;
    } else if (trimmed.startsWith("### ") && currentH2) {
      currentH3 = { heading: trimmed.slice(4).trim(), items: [] };
      currentH2.h3Blocks.push(currentH3);
    } else if (trimmed.startsWith("- ") && currentH3) {
      currentH3.items.push(trimmed.slice(2).trim());
    } else if (!trimmed.startsWith("#") && !trimmed.startsWith("-") && currentH2 && currentH2.h3Blocks.length === 0) {
      currentH2.subtitle = trimmed;
    }
  }

  if (h2Blocks.length === 0) return null;

  const rootBlock = h2Blocks[0];
  const rootId = makeNodeId([rootBlock.heading]);
  const root: OrgNode = {
    id: rootId,
    label: rootBlock.heading,
    subtitle: rootBlock.subtitle || undefined,
    level: 0,
    layout: getStoredLayout(rootId),
    children: [],
  };

  for (const h3Block of rootBlock.h3Blocks) {
    const h3Id = makeNodeId([rootBlock.heading, h3Block.heading]);
    const h3Node: OrgNode = {
      id: h3Id,
      label: h3Block.heading,
      level: 1,
      layout: getStoredLayout(h3Id),
      children: h3Block.items.map((item) => {
        const itemId = makeNodeId([rootBlock.heading, h3Block.heading, item]);
        return {
          id: itemId,
          label: item,
          level: 2,
          layout: getStoredLayout(itemId),
          children: [],
        };
      }),
    };
    root.children.push(h3Node);
  }

  for (let i = 1; i < h2Blocks.length; i++) {
    const block = h2Blocks[i];
    const blockId = makeNodeId([rootBlock.heading, block.heading]);
    const blockNode: OrgNode = {
      id: blockId,
      label: block.heading,
      level: 1,
      layout: getStoredLayout(blockId),
      children: block.h3Blocks.flatMap((h3) => {
        if (h3.items.length === 0) {
          const h3Id = makeNodeId([rootBlock.heading, block.heading, h3.heading]);
          return [{
            id: h3Id,
            label: h3.heading,
            level: 2,
            layout: getStoredLayout(h3Id),
            children: [],
          }];
        }
        return h3.items.map((item) => {
          const itemId = makeNodeId([rootBlock.heading, block.heading, h3.heading, item]);
          return {
            id: itemId,
            label: item,
            level: 2,
            layout: getStoredLayout(itemId),
            children: [],
          };
        });
      }),
    };
    root.children.push(blockNode);
  }

  return root;
}

export function toggleNodeLayout(
  node: OrgNode,
  targetId: string
): OrgNode {
  if (node.id === targetId) {
    const newLayout = node.layout === "horizontal" ? "vertical" : "horizontal";
    try {
      localStorage.setItem(`layout-${node.id}`, newLayout);
    } catch {
      console.warn("localStorage unavailable; layout preference will not persist.");
    }
    return { ...node, layout: newLayout };
  }
  return {
    ...node,
    children: node.children.map((child) => toggleNodeLayout(child, targetId)),
  };
}
