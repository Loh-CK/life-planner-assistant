export interface ChartSpec {
  type: "pie" | "bar";
  title?: string;
  data: { name: string; value: number }[];
}

export type ContentSegment =
  | { kind: "text"; text: string }
  | { kind: "chart"; chart: ChartSpec };

const CHART_BLOCK_RE = /```chart\s*\n([\s\S]*?)```/g;

const isValidChartSpec = (value: unknown): value is ChartSpec => {
  if (!value || typeof value !== "object") return false;
  const spec = value as Record<string, unknown>;
  if (spec.type !== "pie" && spec.type !== "bar") return false;
  if (!Array.isArray(spec.data)) return false;
  return spec.data.every(
    entry =>
      entry &&
      typeof entry === "object" &&
      typeof (entry as Record<string, unknown>).name === "string" &&
      typeof (entry as Record<string, unknown>).value === "number"
  );
};

/**
 * Splits assistant message content into plain-text and chart segments.
 * Chart segments are fenced ```chart blocks containing a JSON ChartSpec,
 * emitted by the model when asked to visualize data (see system prompt).
 */
export const splitAdvisorContent = (content: string): ContentSegment[] => {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CHART_BLOCK_RE.lastIndex = 0;

  while ((match = CHART_BLOCK_RE.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", text: content.slice(lastIndex, match.index) });
    }
    try {
      const parsed = JSON.parse(match[1]);
      if (isValidChartSpec(parsed)) {
        segments.push({ kind: "chart", chart: parsed });
      } else {
        segments.push({ kind: "text", text: match[0] });
      }
    } catch {
      segments.push({ kind: "text", text: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ kind: "text", text: content.slice(lastIndex) });
  }

  return segments;
};
