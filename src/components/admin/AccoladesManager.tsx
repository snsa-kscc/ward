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

interface AccoladeItem {
  id: number | string | null;
  item: string;
  isNew?: boolean;
}

interface AccoladesManagerProps {
  items: { id: number; item: string }[];
  locale: string;
}

export default function AccoladesManager({
  items,
  locale,
}: AccoladesManagerProps) {
  const [accolades, setAccolades] = useState<AccoladeItem[]>(
    items.map((item) => ({ ...item, isNew: false })),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<AccoladeItem | null>(null);

  const hasOrderChanged = () => {
    const existingItems = accolades.filter(
      (acc) => !acc.isNew && typeof acc.id === "number",
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

  const addNewAccolade = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setAccolades((prev) => {
      const newAccolades = [{ id: newId, item: "", isNew: true }, ...prev];
      return newAccolades;
    });
    setExpandedItems((prev) => new Set([...prev, newId]));
    setEditingItems((prev) => new Set([...prev, newId]));
    setHasChanges(true);
  };

  const updateAccolade = (id: string | number, newItem: string) => {
    setAccolades((prev) =>
      prev.map((acc) => {
        return acc.id?.toString() === id.toString()
          ? { ...acc, item: newItem }
          : acc;
      }),
    );
    setHasChanges(true);
  };

  const deleteAccolade = async (id: string | number, index: number) => {
    // Find the actual accolade to determine if it's new or existing
    const accoladeToDelete = accolades[index];

    if (!accoladeToDelete.isNew && typeof accoladeToDelete.id === "number") {
      try {
        const result = await actions.deleteAccolade({
          id: accoladeToDelete.id,
          lang: locale,
        });

        if (result.data === "deleted") {
          setAccolades((prev) =>
            prev.filter((acc) => acc.id !== accoladeToDelete.id),
          );
          toast({
            title: "Success",
            description: "Accolade deleted successfully!",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete accolade.",
          variant: "destructive",
        });
      }
    } else {
      setAccolades((prev) =>
        prev.filter((acc) => acc.id !== accoladeToDelete.id),
      );
      setHasChanges(true);
    }
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      // Create new items first with their correct order
      const newItems: { index: number; item: string }[] = [];
      for (const accolade of accolades) {
        if (accolade.isNew && accolade.item.trim()) {
          const order = accolades.indexOf(accolade) + 1;
          await actions.createAccolade({
            item: accolade.item,
            lang: locale,
            order,
          });
          newItems.push({
            index: accolades.indexOf(accolade),
            item: accolade.item,
          });
        }
      }

      // Then reorder existing items, accounting for new items inserted before them
      const existingItems = accolades.filter(
        (acc) => !acc.isNew && typeof acc.id === "number",
      );
      if (existingItems.length > 0) {
        const updatedOrder = existingItems.map((item, index) => {
          // Calculate the actual position considering new items
          const actualIndex = accolades.indexOf(item);
          const order = actualIndex + 1;
          return {
            id: item.id as number,
            order,
          };
        });
        await actions.reorderAccolades({ items: updatedOrder });
      }

      // Update content for existing items
      for (const accolade of accolades) {
        if (
          !accolade.isNew &&
          accolade.item.trim() &&
          typeof accolade.id === "number"
        ) {
          await actions.updateAccolade({
            id: accolade.id,
            item: accolade.item,
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

  const handleDragStart = (e: React.DragEvent, item: AccoladeItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetItem: AccoladeItem) => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const draggedIndex = accolades.findIndex((i) => i.id === draggedItem.id);
      const targetIndex = accolades.findIndex((i) => i.id === targetItem.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...accolades];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setAccolades(newItems);
        setHasChanges(true);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const getItemId = (acc: AccoladeItem, index: number): string => {
    return acc.id?.toString() || `index-${index}`;
  };

  const isExpanded = (acc: AccoladeItem, index: number) => {
    const id = getItemId(acc, index);
    return expandedItems.has(id);
  };

  const isEditing = (acc: AccoladeItem, index: number) => {
    const id = getItemId(acc, index);
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
          <Button onClick={addNewAccolade} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Accolade
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
        {accolades.map((acc, index) => {
          const id = getItemId(acc, index);
          const expanded = isExpanded(acc, index);
          const editing = isEditing(acc, index);

          return (
            <div
              key={id}
              className={`bg-card rounded-lg border transition-colors ${
                acc.isNew ? "opacity-85" : "hover:bg-muted/90 cursor-move"
              }`}
              draggable={!acc.isNew}
              onDragStart={
                acc.isNew ? undefined : (e) => handleDragStart(e, acc)
              }
              onDragOver={acc.isNew ? undefined : handleDragOver}
              onDragEnter={
                acc.isNew ? undefined : (e) => handleDragEnter(e, acc)
              }
              onDragEnd={acc.isNew ? undefined : handleDragEnd}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                  <p className="text-foreground truncate font-medium">
                    {acc.item || "Untitled accolade"}
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
                    onClick={() => deleteAccolade(id, index)}
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
                      value={acc.item}
                      onChange={(e) => updateAccolade(id, e.target.value)}
                      placeholder="Enter accolade text..."
                      className="text-foreground min-h-[100px] bg-transparent"
                    />
                  ) : (
                    <p className="text-foreground whitespace-pre-wrap">
                      {acc.item}
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
