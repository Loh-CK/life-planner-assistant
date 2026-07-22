import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title", () => {
    render(<PageHeader title="Tasks" />);
    expect(screen.getByRole("heading", { name: "Tasks" })).toBeInTheDocument();
  });

  it("renders an optional description", () => {
    render(<PageHeader title="Tasks" description="Track what needs to get done." />);
    expect(screen.getByText("Track what needs to get done.")).toBeInTheDocument();
  });

  it("omits the description when none is given", () => {
    render(<PageHeader title="Tasks" />);
    expect(screen.queryByText(/track/i)).not.toBeInTheDocument();
  });

  it("renders action content", () => {
    render(<PageHeader title="Tasks" actions={<button>Add Task</button>} />);
    expect(screen.getByRole("button", { name: "Add Task" })).toBeInTheDocument();
  });
});
