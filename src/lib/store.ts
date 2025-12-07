import { writeFile } from "fs/promises";
import path from "path";
import { db } from "db";
import { store } from "db/schema";
import { eq, and } from "drizzle-orm";

export interface UpsertOptions {
  formData: FormData;
  section: string;
  locale: string;
  fileKeys?: string[];
}

export async function upsertStoreData({
  formData,
  section,
  locale,
  fileKeys = [],
}: UpsertOptions) {
  try {
    for (const [key, value] of formData.entries()) {
      if (fileKeys.includes(key)) {
        // Handle file upload - skip if file is empty
        const file = value as File;
        if (file.size > 0 && file.name) {
          const buffer = Buffer.from(await file.arrayBuffer());
          await writeFile(path.join("./public/assets", file.name), buffer);

          const existing = await db
            .select()
            .from(store)
            .where(and(eq(store.key, key as string), eq(store.lang, locale!)))
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(store)
              .set({ value: file.name })
              .where(
                and(eq(store.key, key as string), eq(store.lang, locale!)),
              );
          } else {
            await db.insert(store).values({
              section,
              key: key as string,
              value: file.name,
              lang: locale!,
            });
          }
        }
      } else {
        // Handle text data
        const existing = await db
          .select()
          .from(store)
          .where(and(eq(store.key, key as string), eq(store.lang, locale!)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(store)
            .set({ value: value as string })
            .where(and(eq(store.key, key as string), eq(store.lang, locale!)));
        } else {
          await db.insert(store).values({
            section,
            key: key as string,
            value: value as string,
            lang: locale!,
          });
        }
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error upserting data:", error);
    return { success: false, error };
  }
}
