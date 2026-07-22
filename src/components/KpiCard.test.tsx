import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "./KpiCard";
import { DollarSignIcon } from "lucide-react";

describe("KpiCard", () => {
  it("renders the title and value", () => {
    render(<KpiCard title="Open Tasks" value={3} icon={<DollarSignIcon />} />);
    expect(screen.getByText("Open Tasks")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders a formatted string value", () => {
    render(<KpiCard title="This Month's Spending" value="$505" icon={<DollarSignIcon />} />);
    expect(screen.getByText("$505")).toBeInTheDocument();
  });
});
