import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

export const getFiles = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized access to this project"
      );
    }

    return ctx.db
      .query("files")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getFile = query({
  args: { id: v.id("files") },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", args.id);
    if (!file) {
      throw new Error("File not found");
    }

    const project = await ctx.db.get("projects", file.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized access to this project"
      );
    }

    return file;
  },
});

/**
 * Builds the full path to a file by traversing up the parent chain.
 *
 * Input: A file ID (e.g., the ID of "button.tsx")
 * Output: Array of ancestors from root to file: [{_id, name: "src"}, {_id, name: "components"}, {_id, name: "button.tsx"}]
 *
 * Used for: Breadcrumbs navigation (src > components > button.tsx)
 */

export const getFilePath = query({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", args.id);

    if (!file) {
      throw new Error("File Not Found");
    }

    const project = await ctx.db.get("projects", file.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized access to this project"
      );
    }

    const path: { _id: string; name: string }[] = [];
    let currentId: Id<"files"> | undefined = args.id;

    while (currentId) {
      const file = (await ctx.db.get("files", currentId)) as
        | Doc<"files">
        | undefined;
      if (!file) break;

      path.unshift({ _id: file._id, name: file.name });
      currentId = file.parentId;
    }

    return path;
  },
});

export const getFolderContents = query({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized access to this project"
      );
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    // Sort: folders first, then files, both alphabetically within each group.
    return files.sort((a, b) => {
      // Folders come before files
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;

      // Within same type, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  },
});

export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized access to this project"
      );
    }

    // Check if file with same name already exists in the parent folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    const existingFile = files.find(
      (file) => file.name === args.name && file.type === "file"
    );

    if (existingFile) throw new Error("File already exists with this name");

    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      content: args.content,
      type: "file",
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const project = await ctx.db.get("projects", args.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized acess to this project"
      );
    }

    // Check if file with same name already exists in the parent folder
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", args.projectId).eq("parentId", args.parentId)
      )
      .collect();

    const existing = files.find(
      (file) => file.name === args.name && file.type === "folder"
    );

    if (existing) throw new Error("Folder already exists with this name");
    await ctx.db.insert("files", {
      projectId: args.projectId,
      parentId: args.parentId,
      name: args.name,
      type: "folder",
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", args.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const renameFile = mutation({
  args: {
    id: v.id("files"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", args.id);

    if (!file) throw new Error("File not found");

    const project = await ctx.db.get("projects", file.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized acess to this project"
      );
    }

    // Check if a file with the new name already exists in the same parent folder
    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId)
      )
      .collect();

    const existing = siblings.find(
      (siblings) =>
        siblings.name === args.newName &&
        siblings.type === file.type &&
        siblings._id !== args.id
    );

    if (existing) {
      throw new Error(
        `A ${file.type} with the name already exists in this location`
      );
    }

    // Update the file's name
    await ctx.db.patch("files", args.id, {
      name: args.newName,
      updatedAt: Date.now(),
    });

    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const deleteFile = mutation({
  args: {
    id: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", args.id);

    if (!file) throw new Error("File not found");

    const project = await ctx.db.get("projects", file.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized acess to this project"
      );
    }

    // Recursively delete file/folder and all descendants
    const deleteRecursive = async (fileId: Id<"files">) => {
      const item = await ctx.db.get("files", fileId);

      if (!item) return;

      // If it's a folder, delete all children first
      if (item.type === "folder") {
        const children = await ctx.db
          .query("files")
          .withIndex("by_project_parent", (q) =>
            q.eq("projectId", item.projectId).eq("parentId", fileId)
          )
          .collect();

        for (const child of children) {
          await deleteRecursive(child._id);
        }
      }

      // Delete storage file if it exists
      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }

      // Finally, delete the file/folder itself
      await ctx.db.delete("files", fileId);
    };

    await deleteRecursive(args.id);

    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

export const updateFile = mutation({
  args: {
    id: v.id("files"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", args.id);

    if (!file) throw new Error("File not found");

    const project = await ctx.db.get("projects", file.projectId);

    if (!project || project.ownerId !== identity.subject) {
      throw new Error(
        "Project not found or Unauthorized acess to this project"
      );
    }

    const now = Date.now();

    await ctx.db.patch("files", args.id, {
      content: args.content,
      updatedAt: now,
    });

    // Optionally, update the project's updatedAt timestamp
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});
