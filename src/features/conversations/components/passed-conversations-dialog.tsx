"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConversations } from "../hooks/use-conversations";
import { formatDistanceToNow } from "date-fns";

interface PastConversationsDialogProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (conversationId: Id<"conversations">) => void;
}

export const PastConversationsDialog = ({
  onOpenChange,
  open,
  projectId,
  onSelect,
}: PastConversationsDialogProps) => {
  const conversations = useConversations(projectId);

  const handleSelect = (conversationId: Id<"conversations">) => {
    onSelect(conversationId);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Past Conversations"
      description="Seach and select a past conversation"
    >
      <CommandInput placeholder="Search Conversations...." />
      <CommandList>
        <CommandEmpty>No Conversations found...</CommandEmpty>
        <CommandGroup heading="Conversations">
          {conversations?.map((conversation) => (
            <CommandItem
              key={conversation._id}
              value={`${conversation.title}-${conversation._id}`}
              onSelect={() => handleSelect(conversation._id)}
            >
              <div className="flex flex-col gap-0.5">
                <span>{conversation.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(conversation._creationTime, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
