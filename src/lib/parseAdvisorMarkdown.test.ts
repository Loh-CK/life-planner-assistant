import { describe, it, expect } from "vitest";
import { parseAdvisorMarkdown } from "./parseAdvisorMarkdown";

describe("parseAdvisorMarkdown", () => {
  it("wraps plain lines in paragraphs", () => {
    expect(parseAdvisorMarkdown("Hello there")).toBe("<p>Hello there</p>");
  });

  it("renders bold text", () => {
    expect(parseAdvisorMarkdown("**important**")).toBe("<p><strong>important</strong></p>");
  });

  it("renders inline code", () => {
    expect(parseAdvisorMarkdown("`npm run dev`")).toBe("<p><code>npm run dev</code></p>");
  });

  it("renders a bullet list", () => {
    const html = parseAdvisorMarkdown("- one\n- two");
    expect(html).toBe("<ul><li>one</li><li>two</li></ul>");
  });

  it("renders a numbered list", () => {
    const html = parseAdvisorMarkdown("1. first\n2. second");
    expect(html).toBe("<ol><li>first</li><li>second</li></ol>");
  });

  it("renders a markdown table into a real <table>", () => {
    const input = ["| Time | Activity |", "|------|----------|", "| 07:00 | Wake up |"].join(
      "\n"
    );
    const html = parseAdvisorMarkdown(input);
    expect(html).toBe(
      "<table><thead><tr><th>Time</th><th>Activity</th></tr></thead><tbody>" +
        "<tr><td>07:00</td><td>Wake up</td></tr></tbody></table>"
    );
  });

  it("does not treat a normal line starting with | but no separator row as a table", () => {
    const html = parseAdvisorMarkdown("| not a table |");
    expect(html).toBe("<p>| not a table |</p>");
  });

  it("mixes prose, a table and a list in one response", () => {
    const input = [
      "Summary:",
      "| Category | Amount |",
      "|---|---|",
      "| Food | $5 |",
      "",
      "Next steps",
      "1. Track receipts",
    ].join("\n");
    const html = parseAdvisorMarkdown(input);
    expect(html).toContain("<p>Summary:</p>");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>Category</th>");
    expect(html).toContain("<td>Food</td>");
    expect(html).toContain("<p>Next steps</p>");
    expect(html).toContain("<ol><li>Track receipts</li></ol>");
  });
});
