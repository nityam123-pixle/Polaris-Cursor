import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

export const useConversation = (id: Id<"conversations"> | null) => {
  return useQuery(api.conversations.getById, id ? { id } : "skip");
};

export const useMessages = (conversationId: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip"
  );
};

export const useConversations = (projectId: Id<"projects">) => {
  return useQuery(api.conversations.getByProject, { projectId });
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.create).withOptimisticUpdate(
    (localStorage, args) => {
      const existingConversation = localStorage.getQuery(
        api.conversations.getByProject,
        { projectId: args.projectId }
      );

      if (existingConversation !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- optimistic update callbacks run on mutation, not render
        const now = Date.now();
        const newConversation = {
          _id: crypto.randomUUID() as Id<"conversations">,
          _creationTime: now,
          projectId: args.projectId,
          title: args.title,
          createdAt: now,
          updatedAt: now,
        };

        localStorage.setQuery(
          api.conversations.getByProject,
          { projectId: args.projectId },
          [newConversation, ...existingConversation]
        );
      }
    }
  );
};
