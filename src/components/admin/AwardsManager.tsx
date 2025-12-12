import { actions } from "astro:actions";
import ListManager from "@/components/admin/ListManager";

interface AwardsManagerProps {
  items: { id: number; item: string }[];
  locale: string;
}

export default function AwardsManager({ items, locale }: AwardsManagerProps) {
  return (
    <ListManager
      items={items}
      locale={locale}
      actions={{
        create: actions.createAward,
        update: actions.updateAward,
        remove: actions.deleteAward,
        reorder: actions.reorderAwards,
      }}
      labels={{
        addButton: "Add Award",
        untitled: "Untitled award",
        textareaPlaceholder: "Enter award text...",
        deleteSuccess: "Award deleted successfully!",
        deleteFailed: "Failed to delete award.",
        saveSuccess: "All changes saved successfully!",
        saveFailed: "Failed to save changes.",
      }}
    />
  );
}
