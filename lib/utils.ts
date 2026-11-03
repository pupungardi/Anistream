import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Anime } from "./types"
import { normalizeSlug } from "./hentai-api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extracts genre string names from any genre representation
 * (array of strings, array of { name: '...' } objects, or comma-separated string).
 */
export function getGenreNames(rawGenres: unknown): string[] {
  if (!rawGenres) return [];
  if (typeof rawGenres === 'string') {
    return rawGenres
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (Array.isArray(rawGenres)) {
    return rawGenres
      .map((g) => {
        if (typeof g === 'string') return g.trim();
        if (g && typeof g === 'object') {
          const obj = g as Record<string, unknown>;
          return typeof obj.name === 'string'
            ? obj.name.trim()
            : typeof obj.genre === 'string'
            ? obj.genre.trim()
            : typeof obj.title === 'string'
            ? obj.title.trim()
            : String(g);
        }
        return String(g || '').trim();
      })
      .filter(Boolean);
  }
  return [];
}

/**
 * Checks whether an anime's genres match a target genre keyword safely.
 */
export function hasGenre(rawGenres: unknown, targetGenre: string): boolean {
  const genres = getGenreNames(rawGenres);
  const target = targetGenre.toLowerCase().trim();
  return genres.some((g) => typeof g === 'string' && g.toLowerCase().includes(target));
}

/**
 * Fetches hentai metadata from the server-side proxy endpoint /api/hentai?slug=...
 * and returns the mapped Anime object.
 */
export async function fetchHentaiData(inputSlug: string): Promise<Anime> {
  const cleanSlug = normalizeSlug(inputSlug);
  if (!cleanSlug) {
    throw new Error('Slug tidak valid, coba contoh: my-mother-1');
  }

  const res = await fetch(`/api/hentai?slug=${encodeURIComponent(cleanSlug)}`);
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success || !json?.data) {
    const errorMsg = json?.error || 'Slug tidak valid, coba contoh: my-mother-1';
    throw new Error(errorMsg);
  }

  return json.data as Anime;
}
