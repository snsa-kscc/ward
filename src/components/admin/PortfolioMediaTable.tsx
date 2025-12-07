import { useState, useEffect, useRef } from "react";
import { actions } from "astro:actions";
import DraggableTable, {
  type TableItem,
} from "@/components/admin/DraggableTable";

interface PortfolioMediaTableProps {
  filenames: string[];
  title: string;
}

export default function PortfolioMediaTable({
  filenames,
  title,
}: PortfolioMediaTableProps) {
  const [items, setItems] = useState<string[]>(filenames);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(filenames);
  }, [filenames]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = JSON.stringify(items);
    }
  }, [items]);

  const tableItems: TableItem[] = items.map((filename) => ({
    id: filename,
    label: filename,
  }));

  const handleReorder = (newItems: TableItem[]) => {
    setItems(newItems.map((item) => item.id as string));
  };

  const handleDelete = async (item: TableItem): Promise<boolean> => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("item", item.id as string);
    const result = await actions.deletePortfolioMedia(formData);
    if (result.data === "deleted") {
      setItems((prev) => prev.filter((i) => i !== item.id));
      return true;
    }
    return false;
  };

  return (
    <>
      <DraggableTable
        items={tableItems}
        columns={[{ key: "filename", label: "Filename" }]}
        emptyMessage="No media files uploaded"
        draggable={true}
        onReorder={handleReorder}
        onDelete={handleDelete}
      />
      <input
        ref={hiddenInputRef}
        type="hidden"
        name="media_order"
        value={JSON.stringify(items)}
      />
    </>
  );
}
