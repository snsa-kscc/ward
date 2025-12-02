import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical, Trash2 } from "lucide-react";

interface MediaTableProps {
  filenames: string[];
  title: string;
}

export default function MediaTable({ filenames, title }: MediaTableProps) {
  const [items, setItems] = useState<string[]>(filenames);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(filenames);
  }, [filenames]);

  useEffect(() => {
    // Update hidden input whenever items change
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = JSON.stringify(items);
    }
  }, [items]);

  // Listen for successful deletion events
  useEffect(() => {
    const handleMediaDeleted = (e: CustomEvent) => {
      const { filename } = e.detail;
      const newItems = items.filter((item) => item !== filename);
      setItems(newItems);
    };

    window.addEventListener(
      "mediaDeleted",
      handleMediaDeleted as EventListener,
    );
    return () => {
      window.removeEventListener(
        "mediaDeleted",
        handleMediaDeleted as EventListener,
      );
    };
  }, [items]);

  const handleDragStart = (e: React.DragEvent, filename: string) => {
    setDraggedItem(filename);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, filename: string) => {
    if (draggedItem && draggedItem !== filename) {
      const draggedIndex = items.indexOf(draggedItem);
      const targetIndex = items.indexOf(filename);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...items];
        newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setItems(newItems);
      }
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDelete = async (filename: string) => {
    try {
      // Call the delete action directly from the component
      const { actions } = await import("astro:actions");
      const result = await actions.deleteMedia({
        title: title,
        item: filename,
      });
      console.log("result", result);
      if (result.data === "deleted") {
        // Remove from local state on successful deletion
        const newItems = items.filter((item) => item !== filename);
        setItems(newItems);
      } else {
        alert("Failed to delete media file");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      alert("Error deleting media file");
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Filename</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((filename) => (
              <TableRow
                key={filename}
                className={`cursor-move transition-colors ${
                  draggedItem === filename ? "opacity-50" : "hover:bg-muted/50"
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, filename)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, filename)}
                onDragEnd={handleDragEnd}
              >
                <TableCell>
                  <GripVertical className="text-muted-foreground h-4 w-4" />
                </TableCell>
                <TableCell className="font-medium">{filename}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(filename)}
                    className="h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground py-8 text-center"
                >
                  No media files uploaded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <input
        ref={hiddenInputRef}
        type="hidden"
        name="media_order"
        value={JSON.stringify(items)}
      />
    </>
  );
}
