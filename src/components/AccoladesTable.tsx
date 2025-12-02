import { actions } from "astro:actions";
import DraggableTable, { type TableItem } from "./DraggableTable";

interface AccoladesTableProps {
  items: { id: number; item: string }[];
  locale: string;
}

function shortenText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export default function AccoladesTable({ items, locale }: AccoladesTableProps) {
  const tableItems: TableItem[] = items.map((item) => ({
    id: item.id,
    label: shortenText(item.item),
    href: `/${locale}/admin/accolades/${item.id}`,
  }));

  const handleDelete = async (item: TableItem): Promise<boolean> => {
    const result = await actions.deleteAccolade({
      id: Number(item.id),
      lang: locale,
    });
    return result.data === "deleted";
  };

  return (
    <DraggableTable
      items={tableItems}
      columns={[{ key: "item", label: "Accolade" }]}
      emptyMessage="No accolades"
      draggable={true}
      onDelete={handleDelete}
    />
  );
}
