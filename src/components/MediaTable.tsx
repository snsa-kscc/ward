import { useState, useEffect, useRef, useActionState } from "react";
import { actions } from "astro:actions";
import { experimental_withState as withState } from "@astrojs/react/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GripVertical, Trash2, Loader2 } from "lucide-react";

interface MediaTableProps {
  filenames: string[];
  title: string;
}

export default function MediaTable({ filenames, title }: MediaTableProps) {
  const [items, setItems] = useState<string[]>(filenames);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [state, deleteAction, pending] = useActionState(
    withState(actions.deleteMedia),
    {
      data: "",
      error: undefined,
    },
  );

  useEffect(() => {
    if (state?.data === "deleted" && deletingItem) {
      setItems((prev) => prev.filter((item) => item !== deletingItem));
      setDeletingItem(null);
    }
  }, [state, deletingItem]);

  useEffect(() => {
    setItems(filenames);
  }, [filenames]);

  useEffect(() => {
    // Update hidden input whenever items change
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = JSON.stringify(items);
    }
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>filename</TableHead>
              <TableHead className="w-24">actions</TableHead>
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
                  <form
                    action={deleteAction}
                    onSubmit={() => setDeletingItem(filename)}
                  >
                    <input type="hidden" name="title" value={title} />
                    <input type="hidden" name="item" value={filename} />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="h-8 px-2"
                      disabled={pending && deletingItem === filename}
                    >
                      {pending && deletingItem === filename ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </form>
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
