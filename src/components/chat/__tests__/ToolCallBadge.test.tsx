import { render, screen, cleanup } from "@testing-library/react";
import { describe, test, expect, afterEach } from "vitest";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

describe("str_replace_editor", () => {
  test("create → Creating {file}", () => {
    render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/components/Card.tsx" }} isPending={false} />);
    expect(screen.getByText("Creating Card.tsx")).toBeTruthy();
  });

  test("str_replace → Editing {file}", () => {
    render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "src/components/Button.tsx" }} isPending={false} />);
    expect(screen.getByText("Editing Button.tsx")).toBeTruthy();
  });

  test("insert → Inserting into {file}", () => {
    render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "insert", path: "src/index.ts" }} isPending={false} />);
    expect(screen.getByText("Inserting into index.ts")).toBeTruthy();
  });

  test("view → Reading {file}", () => {
    render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "view", path: "src/utils.ts" }} isPending={false} />);
    expect(screen.getByText("Reading utils.ts")).toBeTruthy();
  });

  test("undo_edit → Undoing edit in {file}", () => {
    render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "undo_edit", path: "src/App.tsx" }} isPending={false} />);
    expect(screen.getByText("Undoing edit in App.tsx")).toBeTruthy();
  });
});

describe("file_manager", () => {
  test("rename with new_path → Renaming {file} to {new_file}", () => {
    render(<ToolCallBadge toolName="file_manager" args={{ command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" }} isPending={false} />);
    expect(screen.getByText("Renaming Old.tsx to New.tsx")).toBeTruthy();
  });

  test("delete → Deleting {file}", () => {
    render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "src/Unused.tsx" }} isPending={false} />);
    expect(screen.getByText("Deleting Unused.tsx")).toBeTruthy();
  });
});

describe("pending state", () => {
  test("isPending=true shows spinner", () => {
    const { container } = render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/App.tsx" }} isPending={true} />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  test("isPending=false shows green dot, no spinner", () => {
    const { container } = render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "src/App.tsx" }} isPending={false} />);
    expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});

describe("unknown tool", () => {
  test("falls back to raw tool name", () => {
    render(<ToolCallBadge toolName="unknown_tool" args={{ command: "create", path: "src/App.tsx" }} isPending={false} />);
    expect(screen.getByText("unknown_tool")).toBeTruthy();
  });
});
