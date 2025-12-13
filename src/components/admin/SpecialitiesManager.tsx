import { useEffect, useRef, useState } from "react";
import { actions } from "astro:actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { navigate } from "astro:transitions/client";

interface SpecialityItem {
  id: number | string;
  item: string;
  media: string | null;
  file: File | null;
  isNew?: boolean;
}

interface SpecialitiesManagerProps {
  items: { id: number; item: string; media: string | null }[];
  locale: string;
}

export default function SpecialitiesManager({
  items,
  locale,
}: SpecialitiesManagerProps) {
  const [listItems, setListItems] = useState<SpecialityItem[]>(
    items.map((item) => ({ ...item, file: null, isNew: false })),
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<SpecialityItem | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    setListItems(items.map((item) => ({ ...item, file: null, isNew: false })));
  }, [items]);

  const getItemId = (listItem: SpecialityItem, index: number): string => {
    return listItem.id?.toString() || `index-${index}`;
  };

  const isExpanded = (listItem: SpecialityItem, index: number) => {
    const id = getItemId(listItem, index);
    return expandedItems.has(id);
  };

  const toggleExpanded = (id: string | number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      const idStr = id.toString();
      if (next.has(idStr)) {
        next.delete(idStr);
      } else {
        next.add(idStr);
      }
      return next;
    });
  };

  const addNewItem = () => {
    const newId = `new-${Date.now()}-${Math.random()}`;
    setListItems((prev) => [
      { id: newId, item: "", media: null, file: null, isNew: true },
      ...prev,
    ]);
    setExpandedItems((prev) => new Set([...prev, newId]));
    setHasChanges(true);
  };

  const updateItemText = (id: string | number, value: string) => {
    setListItems((prev) =>
      prev.map((it) =>
        it.id.toString() === id.toString() ? { ...it, item: value } : it,
      ),
    );
    setHasChanges(true);
  };

  const updateItemFile = (id: string | number, file: File | null) => {
    setListItems((prev) =>
      prev.map((it) =>
        it.id.toString() === id.toString() ? { ...it, file } : it,
      ),
    );
    setHasChanges(true);
  };

  const deleteItem = async (index: number) => {
    const itemToDelete = listItems[index];
    if (!itemToDelete) return;

    if (!itemToDelete.isNew && typeof itemToDelete.id === "number") {
      try {
        const result = await actions.deleteSpeciality({
          id: itemToDelete.id,
          lang: locale,
        });

        if (result.data === "deleted") {
          setListItems((prev) =>
            prev.filter((it) => it.id !== itemToDelete.id),
          );
          toast({
            title: "Success",
            description: "Speciality deleted successfully!",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete speciality.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete speciality.",
          variant: "destructive",
        });
      }
    } else {
      setListItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setHasChanges(true);
    }
  };

  const deleteMedia = async (id: number | string) => {
    if (typeof id !== "number") return;

    try {
      const result = await actions.deleteSpecialityMedia({ id, lang: locale });
      if (result.data === "deleted") {
        setListItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, media: null } : it)),
        );
        const key = id.toString();
        const ref = fileInputRefs.current.get(key);
        if (ref) ref.value = "";
        toast({ title: "Success", description: "Media deleted successfully!" });
        setHasChanges(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete media.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete media.",
        variant: "destructive",
      });
    }
  };

  const hasOrderChanged = () => {
    const existingItems = listItems.filter(
      (it) => !it.isNew && typeof it.id === "number",
    );
    const currentOrder = existingItems.map((it) => it.id).join(",");
    const initialOrder = items.map((it) => it.id).join(",");
    return currentOrder !== initialOrder;
  };

  const saveAllChanges = async () => {
    const invalidNewItems = listItems
      .map((listItem, index) => ({
        listItem,
        index,
        id: getItemId(listItem, index),
      }))
      .filter(
        ({ listItem }) =>
          listItem.isNew && (!listItem.item.trim() || !listItem.file),
      );

    if (invalidNewItems.length > 0) {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        for (const { id } of invalidNewItems) next.add(id);
        return next;
      });
      toast({
        title: "Error",
        description:
          "Please provide text and a file for all new specialities before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const createPromises = listItems
        .map((listItem, index) => {
          if (!listItem.isNew || !listItem.item.trim()) return null;

          const order = index + 1;
          const formData = new FormData();
          formData.append("item", listItem.item);
          formData.append("lang", locale);
          formData.append("order", String(order));
          if (listItem.file) {
            formData.append("file", listItem.file);
          }
          return actions.createSpeciality(formData);
        })
        .filter(Boolean);

      if (createPromises.length > 0) {
        await Promise.all(createPromises);
      }

      const existingItems = listItems.filter(
        (it) => !it.isNew && typeof it.id === "number",
      );
      if (existingItems.length > 0) {
        const updatedOrder = existingItems.map((it) => {
          const actualIndex = listItems.indexOf(it);
          return { id: it.id as number, order: actualIndex + 1 };
        });
        await actions.reorderSpecialities({ items: updatedOrder });
      }

      const updatePromises = listItems
        .map((listItem) => {
          if (
            listItem.isNew ||
            !listItem.item.trim() ||
            typeof listItem.id !== "number"
          ) {
            return null;
          }

          const formData = new FormData();
          formData.append("id", String(listItem.id));
          formData.append("item", listItem.item);
          formData.append("lang", locale);
          if (listItem.file) {
            formData.append("file", listItem.file);
          }
          return actions.updateSpeciality(formData);
        })
        .filter(Boolean);

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      setHasChanges(false);
      setExpandedItems(new Set());

      navigate(`${window.location.pathname}?update=success`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });

      navigate(`${window.location.pathname}?update=error`);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: SpecialityItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (targetItem: SpecialityItem) => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const draggedIndex = listItems.findIndex((i) => i.id === draggedItem.id);
      const targetIndex = listItems.findIndex((i) => i.id === targetItem.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const next = [...listItems];
        next.splice(draggedIndex, 1);
        next.splice(targetIndex, 0, draggedItem);
        setListItems(next);
        setHasChanges(true);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="space-y-4 py-8">
      <div className="flex items-center justify-between gap-2">
        <p>When deleting no need to save.</p>
        <div className="flex items-center gap-2">
          <Button onClick={addNewItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Speciality
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
          const draggable = !listItem.isNew && !expanded;

          return (
            <div
              key={id}
              className={`bg-card rounded-lg border transition-colors ${
                listItem.isNew ? "opacity-85" : "hover:bg-muted/90 cursor-move"
              }`}
              draggable={draggable}
              onDragStart={
                draggable ? (e) => handleDragStart(e, listItem) : undefined
              }
              onDragOver={draggable ? handleDragOver : undefined}
              onDragEnter={
                draggable ? () => handleDragEnter(listItem) : undefined
              }
              onDragEnd={draggable ? handleDragEnd : undefined}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate font-medium">
                      {listItem.item || "Untitled speciality"}
                    </p>
                    {listItem.media && (
                      <p className="text-muted-foreground truncate text-xs">
                        {listItem.media}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => toggleExpanded(id)}>
                    {expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
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
                <div className="space-y-4 border-t p-4">
                  <Textarea
                    value={listItem.item}
                    onChange={(e) => updateItemText(id, e.target.value)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    placeholder="Enter speciality text..."
                    className="text-foreground min-h-[100px] bg-transparent"
                  />

                  <div className="space-y-2">
                    {listItem.media && (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={`/assets/specialities/${listItem.media}`}
                            alt={`Speciality image ${listItem.media}`}
                            className="h-14 w-14 rounded-md object-cover"
                            loading="lazy"
                          />
                          <p className="text-sm">{listItem.media}</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMedia(listItem.id)}
                        >
                          Delete media
                        </Button>
                      </div>
                    )}

                    <Input
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(id, el);
                      }}
                      required={listItem.isNew && !listItem.media}
                      type="file"
                      className="text-black"
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0] ?? null;
                        updateItemFile(id, file);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
