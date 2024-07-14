import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function formatParagraph(input: string): string {
  return input.replace(/\r\n/g, "<br>");
}

export function splitAndWrapImages(images: string[]): string[][] {
  const n = images.length;
  const partSize = Math.floor(n / 3);
  const remainder = n % 3;

  const sizes = [partSize, partSize, partSize];

  if (remainder === 1) {
    sizes[1] += 1;
  } else if (remainder === 2) {
    sizes[1] += 2;
  }

  // Split the array into three parts
  const parts = [images.slice(0, sizes[0]), images.slice(sizes[0], sizes[0] + sizes[1]), images.slice(sizes[0] + sizes[1])];
  return parts;
}
