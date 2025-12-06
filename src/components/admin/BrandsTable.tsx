import { actions } from "astro:actions";
import DraggableTable, {
  type TableItem,
} from "@/components/admin/DraggableTable";

interface BrandsTableProps {
  items: { id: number; name: string; slug: string }[];
  locale: string;
}

export default function BrandsTable({ items, locale }: BrandsTableProps) {
  const tableItems: TableItem[] = items.map((item) => ({
    id: item.id,
    label: item.name,
    href: `/${locale}/admin/brands/${item.slug}`,
  }));

  const handleDelete = async (item: TableItem): Promise<boolean> => {
    const result = await actions.deleteBrand({ title: item.label });
    return result.data === "deleted";
  };

  const handleSaveOrder = async (
    orderedItems: TableItem[],
  ): Promise<boolean> => {
    const result = await actions.reorderBrands({
      items: orderedItems.map((item, index) => ({
        id: item.id as number,
        order: index + 1,
      })),
    });
    return result.data === "updated";
  };

  return (
    <DraggableTable
      items={tableItems}
      columns={[{ key: "name", label: "Item" }]}
      emptyMessage="No brand items"
      draggable={true}
      onDelete={handleDelete}
      onSaveOrder={handleSaveOrder}
    />
  );
}
