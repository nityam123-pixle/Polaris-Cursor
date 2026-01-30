"use client";

import { cn } from "@/lib/utils";
import { Allotment } from "allotment";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FileExplorer } from "./file explorer";
import { EditorView } from "@/features/editor/components/editor-view";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 350;
const DEFAULT_MAIN_SIZE = 1000;

const Tab = ({
  label,
  isActive,
  onClick,
  id,
  controls,
  onKeyDown,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  id: string;
  controls: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={isActive}
      aria-controls={controls}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "flex items-center gap-2 h-full px-3 border-r",
        "cursor-pointer text-muted-foreground hover:bg-accent/30",
        isActive && "bg-background text-foreground"
      )}
    >
      <span className="text-sm">{label}</span>
    </button>
  );
};

export const ProjectIdView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");

  const views: Array<"editor" | "preview"> = ["editor", "preview"];

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex = index;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % views.length;
    }

    if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + views.length) % views.length;
    }

    if (nextIndex !== index) {
      e.preventDefault();
      setActiveView(views[nextIndex]);
      document.getElementById(`tab-${views[nextIndex]}`)?.focus();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <nav
        role="tablist"
        aria-label="Project views"
        className="h-8.75 flex items-center bg-sidebar border-b"
      >
        <Tab
          label="Code"
          isActive={activeView === "editor"}
          id="tab-editor"
          controls="panel-editor"
          onClick={() => setActiveView("editor")}
          onKeyDown={(e) => handleTabKeyDown(e, 0)}
        />
        <Tab
          label="Preview"
          isActive={activeView === "preview"}
          id="tab-preview"
          controls="panel-preview"
          onClick={() => setActiveView("preview")}
          onKeyDown={(e) => handleTabKeyDown(e, 1)}
        />

        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center gap-1.5 h-full px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
            <FaGithub className="size-3.5" />
            <span className="text-sm">Export</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        <div
          id="panel-editor"
          role="tabpanel"
          aria-labelledby="tab-editor"
          className={cn(
            "absolute inset-0",
            activeView === "editor" ? "visible" : "invisible"
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <EditorView projectId={projectId} />
            </Allotment.Pane>
          </Allotment>
        </div>

        <div
          id="panel-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className={cn(
            "absolute inset-0",
            activeView === "preview" ? "visible" : "invisible"
          )}
        >
          <div>Preview!</div>
        </div>
      </div>
    </div>
  );
};
