"use client";

import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  isPending: boolean;
}

function getFileName(path: unknown): string {
  if (typeof path !== "string") return "";
  return path.split("/").pop() || path;
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const command = args.command as string;
  const file = getFileName(args.path);

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create": return `Creating ${file}`;
      case "str_replace": return `Editing ${file}`;
      case "insert": return `Inserting into ${file}`;
      case "view": return `Reading ${file}`;
      case "undo_edit": return `Undoing edit in ${file}`;
      default: return `Updating ${file}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename": {
        const newFile = getFileName(args.new_path);
        return newFile ? `Renaming ${file} to ${newFile}` : `Renaming ${file}`;
      }
      case "delete": return `Deleting ${file}`;
      default: return `Managing ${file}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, isPending }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
