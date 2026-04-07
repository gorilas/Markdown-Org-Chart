export interface OrgNode {
  id: string;
  label: string;
  subtitle?: string;
  level: number;
  children: OrgNode[];
  layout: "horizontal" | "vertical";
}

export function parseMarkdownToTree(markdown: string): OrgNode | null {
  const lines = markdown.split("\n");
  let nodeCounter = 0;

  function makeId() {
    return `node-${++nodeCounter}`;
  }

  function getStoredLayout(id: string): "horizontal" | "vertical" {
    try {
      const stored = localStorage.getItem(`layout-${id}`);
      if (stored === "horizontal" || stored === "vertical") return stored;
    } catch {}
    return "horizontal";
  }

  const h2Blocks: { heading: string; subtitle: string; h3Blocks: { heading: string; items: string[] }[] }[] = [];
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
  const rootId = makeId();
  const root: OrgNode = {
    id: rootId,
    label: rootBlock.heading,
    subtitle: rootBlock.subtitle || undefined,
    level: 0,
    layout: getStoredLayout(rootId),
    children: [],
  };

  for (const h3Block of rootBlock.h3Blocks) {
    const h3Id = makeId();
    const h3Node: OrgNode = {
      id: h3Id,
      label: h3Block.heading,
      level: 1,
      layout: getStoredLayout(h3Id),
      children: h3Block.items.map((item) => {
        const itemId = makeId();
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

  // Additional h2 blocks become children of root
  for (let i = 1; i < h2Blocks.length; i++) {
    const block = h2Blocks[i];
    const blockId = makeId();
    const blockNode: OrgNode = {
      id: blockId,
      label: block.heading,
      level: 1,
      layout: getStoredLayout(blockId),
      children: block.h3Blocks.flatMap((h3) =>
        h3.items.map((item) => {
          const itemId = makeId();
          return {
            id: itemId,
            label: item,
            level: 2,
            layout: getStoredLayout(itemId),
            children: [],
          };
        })
      ),
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
    } catch {}
    return { ...node, layout: newLayout };
  }
  return {
    ...node,
    children: node.children.map((child) => toggleNodeLayout(child, targetId)),
  };
}
