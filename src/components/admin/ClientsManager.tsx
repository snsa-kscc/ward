import { actions } from "astro:actions";
import ListManager from "@/components/admin/ListManager";

interface ClientsManagerProps {
  items: { id: number; item: string }[];
  locale: string;
}

export default function ClientsManager({ items, locale }: ClientsManagerProps) {
  return (
    <ListManager
      items={items}
      locale={locale}
      actions={{
        create: actions.createClient.orThrow,
        update: actions.updateClient.orThrow,
        remove: actions.deleteClient.orThrow,
        reorder: actions.reorderClients.orThrow,
      }}
      labels={{
        addButton: "Add Client",
        untitled: "Untitled client",
        textareaPlaceholder: "Enter client text...",
        deleteSuccess: "Client deleted successfully!",
        deleteFailed: "Failed to delete client.",
        saveSuccess: "All changes saved successfully!",
        saveFailed: "Failed to save changes.",
      }}
    />
  );
}
