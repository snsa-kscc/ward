import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical, Trash2, Loader2, Save } from "lucide-react";

export interface TableItem {
  id: string | number;
  label: string;
  href?: string;
}

interface DraggableTableProps {
  items: TableItem[];
  columns: { key: string; label: string }[];
  emptyMessage?: string;
  draggable?: boolean;
  showActions?: boolean;
  onReorder?: (items: TableItem[]) => void;
  onDelete?: (item: TableItem) => Promise<boolean>;
  onSaveOrder?: (items: TableItem[]) => Promise<boolean>;
  deletingId?: string | number | null;
}

export default function DraggableTable({
  items: initialItems,
  columns,
  emptyMessage = "No items",
  draggable = true,
  showActions = true,
  onReorder,
  onDelete,
  onSaveOrder,
  deletingId,
}: DraggableTableProps) {
  const [items, setItems] = useState<TableItem[]>(initialItems);
  const [draggedItem, setDraggedItem] = useState<TableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialOrderRef = useMemo(
    () => initialItems.map((item) => item.id).join(","),
    [initialItems],
  );

  const hasOrderChanged = useMemo(() => {
    const currentOrder = items.map((item) => item.id).join(",");
    return currentOrder !== initialOrderRef;
  }, [items, initialOrderRef]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (deletingId !== undefined) {
      setIsDeleting(deletingId);
    }
  }, [deletingId]);

  const handleSaveOrder = async () => {
    if (!onSaveOrder) return;
    setIsSaving(true);
    await onSaveOrder(items);
    setIsSaving(false);
  };

  const handleDragStart = (e: React.DragEvent, item: TableItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (item: TableItem) => {
    if (draggedItem && draggedItem.id !== item.id) {
      const draggedIndex = items.findIndex((i) => i.id === draggedItem.id);
      const targetIndex = items.findIndex((i) => i.id === item.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...items];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setItems(newItems);
        onReorder?.(newItems);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDelete = async (item: TableItem) => {
    if (!onDelete) return;
    setIsDeleting(item.id);
    const success = await onDelete(item);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    setIsDeleting(null);
  };

  return (
    <div className="my-4">
      {hasOrderChanged && onSaveOrder && (
        <div className="mb-2 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSaveOrder}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Order
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {draggable && <TableHead className="w-12"></TableHead>}
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              {showActions && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={`${draggable ? "cursor-move" : ""} transition-colors ${
                  draggedItem?.id === item.id
                    ? "opacity-50"
                    : "hover:bg-muted/50"
                }`}
                draggable={draggable}
                onDragStart={
                  draggable ? (e) => handleDragStart(e, item) : undefined
                }
                onDragOver={draggable ? handleDragOver : undefined}
                onDragEnter={
                  draggable ? () => handleDragEnter(item) : undefined
                }
                onDragEnd={draggable ? handleDragEnd : undefined}
              >
                {draggable && (
                  <TableCell>
                    <GripVertical className="text-muted-foreground h-4 w-4" />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {item.href ? (
                    <a href={item.href}>{item.label}</a>
                  ) : (
                    item.label
                  )}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2"
                      disabled={isDeleting === item.id}
                      onClick={() => handleDelete(item)}
                    >
                      {isDeleting === item.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (draggable ? 1 : 0) + (showActions ? 1 : 0)
                  }
                  className="text-muted-foreground py-8 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
