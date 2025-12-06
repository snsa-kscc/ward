import { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  GripVertical,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { navigate } from "astro:transitions/client";

interface ClientItem {
  id: number | string | null;
  item: string;
  isNew?: boolean;
}

interface ClientsManagerProps {
  items: { id: number; item: string }[];
  locale: string;
}

export default function ClientsManager({ items, locale }: ClientsManagerProps) {
  const [clients, setClients] = useState<ClientItem[]>(
    items.map((item) => ({ ...item, isNew: false })),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ClientItem | null>(null);

  const hasOrderChanged = () => {
    const existingItems = clients.filter(
      (client) => !client.isNew && typeof client.id === "number",
    );
    const currentOrder = existingItems.map((item) => item.id).join(",");
    const initialOrder = items.map((item) => item.id).join(",");
    return currentOrder !== initialOrder;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const toggleExpanded = (id: string | number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      const idStr = id.toString();
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const toggleEditing = (id: string | number) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      const idStr = id.toString();
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const addNewClient = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setClients((prev) => {
      const newClients = [{ id: newId, item: "", isNew: true }, ...prev];
      return newClients;
    });
    setExpandedItems((prev) => new Set([...prev, newId]));
    setEditingItems((prev) => new Set([...prev, newId]));
    setHasChanges(true);
  };

  const updateClient = (id: string | number, newItem: string) => {
    setClients((prev) =>
      prev.map((client) => {
        return client.id?.toString() === id.toString()
          ? { ...client, item: newItem }
          : client;
      }),
    );
    setHasChanges(true);
  };

  const deleteClient = async (index: number) => {
    // Find the actual client to determine if it's new or existing
    const clientToDelete = clients[index];

    if (!clientToDelete.isNew && typeof clientToDelete.id === "number") {
      try {
        const result = await actions.deleteClient({
          id: clientToDelete.id,
          lang: locale,
        });

        if (result.data === "deleted") {
          setClients((prev) =>
            prev.filter((client) => client.id !== clientToDelete.id),
          );
          toast({
            title: "Success",
            description: "Client deleted successfully!",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete client.",
          variant: "destructive",
        });
      }
    } else {
      setClients((prev) =>
        prev.filter((client) => client.id !== clientToDelete.id),
      );
      setHasChanges(true);
    }
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      // Create new items first with their correct order
      const newItems: { index: number; item: string }[] = [];
      for (const client of clients) {
        if (client.isNew && client.item.trim()) {
          const order = clients.indexOf(client) + 1;
          await actions.createClient({
            item: client.item,
            lang: locale,
            order,
          });
          newItems.push({
            index: clients.indexOf(client),
            item: client.item,
          });
        }
      }

      // Then reorder existing items, accounting for new items inserted before them
      const existingItems = clients.filter(
        (client) => !client.isNew && typeof client.id === "number",
      );
      if (existingItems.length > 0) {
        const updatedOrder = existingItems.map((item) => {
          // Calculate the actual position considering new items
          const actualIndex = clients.indexOf(item);
          const order = actualIndex + 1;
          return {
            id: item.id as number,
            order,
          };
        });
        await actions.reorderClients({ items: updatedOrder });
      }

      // Update content for existing items
      for (const client of clients) {
        if (
          !client.isNew &&
          client.item.trim() &&
          typeof client.id === "number"
        ) {
          await actions.updateClient({
            id: client.id,
            item: client.item,
            lang: locale,
          });
        }
      }

      toast({
        title: "Success",
        description: "All changes saved successfully!",
      });

      setHasChanges(false);
      setEditingItems(new Set()); // Clear editing state
      setExpandedItems(new Set()); // Collapse all items

      setTimeout(() => {
        navigate(window.location.pathname);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ClientItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (targetItem: ClientItem) => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const draggedIndex = clients.findIndex((i) => i.id === draggedItem.id);
      const targetIndex = clients.findIndex((i) => i.id === targetItem.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...clients];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setClients(newItems);
        setHasChanges(true);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getItemId = (client: ClientItem, index: number): string => {
    return client.id?.toString() || `index-${index}`;
  };

  const isExpanded = (client: ClientItem, index: number) => {
    const id = getItemId(client, index);
    return expandedItems.has(id);
  };

  const isEditing = (client: ClientItem, index: number) => {
    const id = getItemId(client, index);
    return editingItems.has(id);
  };

  return (
    <div className="space-y-4 py-8">
      <div className="flex items-center justify-between gap-2">
        <p>
          After saving wait for 2 seconds for the page to refresh. When
          deleting, no need to save.
        </p>
        <div className="flex items-center gap-2">
          <Button onClick={addNewClient} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
          {(hasChanges || hasOrderChanged()) && (
            <Button
              onClick={saveAllChanges}
              variant="secondary"
              size="sm"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save All"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {clients.map((client, index) => {
          const id = getItemId(client, index);
          const expanded = isExpanded(client, index);
          const editing = isEditing(client, index);

          return (
            <div
              key={id}
              className={`bg-card rounded-lg border transition-colors ${
                client.isNew ? "opacity-85" : "hover:bg-muted/90 cursor-move"
              }`}
              draggable={!client.isNew}
              onDragStart={
                client.isNew ? undefined : (e) => handleDragStart(e, client)
              }
              onDragOver={client.isNew ? undefined : handleDragOver}
              onDragEnter={
                client.isNew ? undefined : () => handleDragEnter(client)
              }
              onDragEnd={client.isNew ? undefined : handleDragEnd}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="text-foreground truncate font-medium">
                    {client.item || "Untitled client"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => toggleExpanded(id)}>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {!editing ? (
                    <Button size="sm" onClick={() => toggleEditing(id)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => toggleEditing(id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteClient(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="border-t p-4">
                  {editing ? (
                    <Textarea
                      value={client.item}
                      onChange={(e) => updateClient(id, e.target.value)}
                      placeholder="Enter client text..."
                      className="text-foreground min-h-[100px] bg-transparent"
                    />
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap">
                      {client.item}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
