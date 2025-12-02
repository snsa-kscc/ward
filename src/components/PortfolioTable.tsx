import { actions } from "astro:actions";
import DraggableTable, { type TableItem } from "./DraggableTable";

interface PortfolioTableProps {
  items: { id: number; title: string; slug: string }[];
  locale: string;
}

export default function PortfolioTable({ items, locale }: PortfolioTableProps) {
  const tableItems: TableItem[] = items.map((item) => ({
    id: item.id,
    label: item.title,
    href: `/${locale}/admin/portfolio/${item.slug}`,
  }));

  const handleDelete = async (item: TableItem): Promise<boolean> => {
    const result = await actions.deletePortfolio({ title: item.label });
    return result.data === "deleted";
  };

  return (
    <DraggableTable
      items={tableItems}
      columns={[{ key: "title", label: "Item" }]}
      emptyMessage="No portfolio items"
      draggable={true}
      onDelete={handleDelete}
    />
  );
}
