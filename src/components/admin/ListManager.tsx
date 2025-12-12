import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  GripVertical,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { navigate } from "astro:transitions/client";

interface ListItem {
  id: number | string | null;
  item: string;
  isNew?: boolean;
}

export interface ListManagerActions {
  create: (input: {
    item: string;
    lang: string;
    order?: number;
  }) => Promise<any>;
  update: (input: { id: number; item: string; lang: string }) => Promise<any>;
  remove: (input: { id: number; lang: string }) => Promise<any>;
  reorder: (input: { items: { id: number; order: number }[] }) => Promise<any>;
}

export interface ListManagerLabels {
  addButton: string;
  untitled: string;
  textareaPlaceholder: string;
  deleteSuccess: string;
  deleteFailed: string;
  saveSuccess: string;
  saveFailed: string;
}

interface ListManagerProps {
  items: { id: number; item: string }[];
  locale: string;
  actions: ListManagerActions;
  labels: ListManagerLabels;
}

export default function ListManager({
  items,
  locale,
  actions,
  labels,
}: ListManagerProps) {
  const [listItems, setListItems] = useState<ListItem[]>(
    items.map((item) => ({ ...item, isNew: false })),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ListItem | null>(null);

  const hasOrderChanged = () => {
    const existingItems = listItems.filter(
      (listItem) => !listItem.isNew && typeof listItem.id === "number",
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

  const addNewItem = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setListItems((prev) => {
      const newListItems = [{ id: newId, item: "", isNew: true }, ...prev];
      return newListItems;
    });
    setExpandedItems((prev) => new Set([...prev, newId]));
    setEditingItems((prev) => new Set([...prev, newId]));
    setHasChanges(true);
  };

  const updateItem = (id: string | number, newItem: string) => {
    setListItems((prev) =>
      prev.map((listItem) => {
        return listItem.id?.toString() === id.toString()
          ? { ...listItem, item: newItem }
          : listItem;
      }),
    );
    setHasChanges(true);
  };

  const deleteItem = async (index: number) => {
    const itemToDelete = listItems[index];

    if (!itemToDelete) return;

    if (!itemToDelete.isNew && typeof itemToDelete.id === "number") {
      try {
        const result = await actions.remove({
          id: itemToDelete.id,
          lang: locale,
        });

        if (result.data === "deleted") {
          setListItems((prev) =>
            prev.filter((listItem) => listItem.id !== itemToDelete.id),
          );
          toast({
            title: "Success",
            description: labels.deleteSuccess,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: labels.deleteFailed,
          variant: "destructive",
        });
      }
    } else {
      setListItems((prev) =>
        prev.filter((listItem) => listItem.id !== itemToDelete.id),
      );
      setHasChanges(true);
    }
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const newItems: { index: number; item: string }[] = [];
      for (const listItem of listItems) {
        if (listItem.isNew && listItem.item.trim()) {
          const order = listItems.indexOf(listItem) + 1;
          await actions.create({
            item: listItem.item,
            lang: locale,
            order,
          });
          newItems.push({
            index: listItems.indexOf(listItem),
            item: listItem.item,
          });
        }
      }

      const existingItems = listItems.filter(
        (listItem) => !listItem.isNew && typeof listItem.id === "number",
      );
      if (existingItems.length > 0) {
        const updatedOrder = existingItems.map((item) => {
          const actualIndex = listItems.indexOf(item);
          const order = actualIndex + 1;
          return {
            id: item.id as number,
            order,
          };
        });
        await actions.reorder({ items: updatedOrder });
      }

      for (const listItem of listItems) {
        if (
          !listItem.isNew &&
          listItem.item.trim() &&
          typeof listItem.id === "number"
        ) {
          await actions.update({
            id: listItem.id,
            item: listItem.item,
            lang: locale,
          });
        }
      }

      toast({
        title: "Success",
        description: labels.saveSuccess,
      });

      setHasChanges(false);
      setEditingItems(new Set());
      setExpandedItems(new Set());

      setTimeout(() => {
        navigate(window.location.pathname);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: labels.saveFailed,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: ListItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (targetItem: ListItem) => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const draggedIndex = listItems.findIndex((i) => i.id === draggedItem.id);
      const targetIndex = listItems.findIndex((i) => i.id === targetItem.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...listItems];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setListItems(newItems);
        setHasChanges(true);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getItemId = (listItem: ListItem, index: number): string => {
    return listItem.id?.toString() || `index-${index}`;
  };

  const isExpanded = (listItem: ListItem, index: number) => {
    const id = getItemId(listItem, index);
    return expandedItems.has(id);
  };

  const isEditing = (listItem: ListItem, index: number) => {
    const id = getItemId(listItem, index);
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
          <Button onClick={addNewItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {labels.addButton}
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
        {listItems.map((listItem, index) => {
          const id = getItemId(listItem, index);
          const expanded = isExpanded(listItem, index);
          const editing = isEditing(listItem, index);

          return (
            <div
              key={id}
              className={`bg-card rounded-lg border transition-colors ${
                listItem.isNew ? "opacity-85" : "hover:bg-muted/90 cursor-move"
              }`}
              draggable={!listItem.isNew}
              onDragStart={
                listItem.isNew ? undefined : (e) => handleDragStart(e, listItem)
              }
              onDragOver={listItem.isNew ? undefined : handleDragOver}
              onDragEnter={
                listItem.isNew ? undefined : () => handleDragEnter(listItem)
              }
              onDragEnd={listItem.isNew ? undefined : handleDragEnd}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="text-foreground truncate font-medium">
                    {listItem.item || labels.untitled}
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
                    onClick={() => deleteItem(index)}
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
                      value={listItem.item}
                      onChange={(e) => updateItem(id, e.target.value)}
                      placeholder={labels.textareaPlaceholder}
                      className="text-foreground min-h-[100px] bg-transparent"
                    />
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap">
                      {listItem.item}
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
