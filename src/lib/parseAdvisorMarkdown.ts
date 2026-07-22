const isTableSeparatorRow = (line: string) =>
  /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());

const splitTableRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map(cell => cell.trim());

/**
 * Renders a constrained subset of markdown (bold, inline code, bullet/numbered
 * lists, and pipe tables) used by the Ollama chat responses into HTML.
 */
export const parseAdvisorMarkdown = (text: string) => {
  // Bold and inline code
  const withInline = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  const lines = withInline.split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Markdown table: header row followed by a --- separator row
    if (trimmed.startsWith("|") && isTableSeparatorRow(lines[i + 1] ?? "")) {
      closeList();
      out.push("<table><thead><tr>");
      splitTableRow(trimmed).forEach(cell => out.push(`<th>${cell}</th>`));
      out.push("</tr></thead><tbody>");
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        out.push("<tr>");
        splitTableRow(lines[i]).forEach(cell => out.push(`<td>${cell}</td>`));
        out.push("</tr>");
        i++;
      }
      out.push("</tbody></table>");
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${trimmed.replace(/^[-*]\s+/, "")}</li>`);
      i++;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${trimmed.replace(/^\d+\.\s+/, "")}</li>`);
      i++;
      continue;
    }

    closeList();
    if (trimmed) out.push(`<p>${trimmed}</p>`);
    i++;
  }
  closeList();
  return out.join("");
};
