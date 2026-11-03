import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Anime } from "./types"

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
 * Fetches anime/metadata by slug from the endpoint and returns a formatted Anime object.
 * Extracts title, dates, genres, and cover metadata safely.
 */
export async function fetchHentaiData(slug: string): Promise<Anime> {
  const cleanSlug = encodeURIComponent(slug.trim());
  const res = await fetch(`https://hentaiocean.com/api?action=hentai&slug=${cleanSlug}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch data for slug "${slug}": ${res.statusText}`);
  }

  const rawData = await res.json();
  const data = (rawData && typeof rawData === 'object' && 'data' in rawData)
    ? (rawData as Record<string, unknown>).data
    : rawData;

  const item = (data && typeof data === 'object') ? (data as Record<string, unknown>) : {};

  const title = String(item.title || item.name || slug);
  const japaneseTitle = String(item.japanese_title || item.native_title || item.original_title || title);
  const synopsis = String(item.synopsis || item.description || item.plot || 'No synopsis provided.');
  
  const cover = String(
    item.cover || item.poster || item.image || item.thumbnail || 'https://picsum.photos/seed/anime-cover/600/900'
  );
  const banner = String(
    item.banner || item.backdrop || item.cover || cover
  );

  const rawGenres = item.genres || item.tags || item.categories || [];
  const parsedGenres = getGenreNames(rawGenres);
  const genres = parsedGenres.length > 0 ? parsedGenres : ['Animation'];

  const dateStr = String(item.dates || item.date || item.release_date || item.year || '2024');
  const matchedYear = dateStr.match(/\d{4}/);
  const year = matchedYear ? parseInt(matchedYear[0], 10) : 2024;

  const studio = String(item.studio || item.brand || item.producer || 'Studio');
  const animeId = `hentai-${slug.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()}`;

  const rawEpisodes = Array.isArray(item.episodes) ? item.episodes : [];
  const episodes = rawEpisodes.length > 0
    ? rawEpisodes.map((ep: any, idx: number) => ({
        id: ep.id ? String(ep.id) : `${animeId}-ep-${idx + 1}`,
        animeId,
        episodeNumber: idx + 1,
        title: ep.title ? String(ep.title) : `Episode ${idx + 1}`,
        thumbnail: ep.thumbnail ? String(ep.thumbnail) : cover,
        duration: ep.duration ? String(ep.duration) : '24:00',
        durationSeconds: 1440,
        videoUrl: ep.video_url || ep.videoUrl || ep.stream || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        introStart: 0,
        introEnd: 60,
        synopsis: ep.synopsis ? String(ep.synopsis) : `Episode ${idx + 1}`,
      }))
    : [
        {
          id: `${animeId}-ep-1`,
          animeId,
          episodeNumber: 1,
          title: 'Episode 1',
          thumbnail: cover,
          duration: '24:00',
          durationSeconds: 1440,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          introStart: 0,
          introEnd: 60,
          synopsis: title,
        },
      ];

  return {
    id: animeId,
    title,
    japaneseTitle,
    synopsis,
    bannerImage: banner,
    posterImage: cover,
    rating: typeof item.rating === 'number' ? item.rating : 8.5,
    rank: 1,
    genres,
    season: dateStr || `${year}`,
    year,
    studio,
    episodesCount: episodes.length,
    status: item.status === 'Ongoing' ? 'Airing' : 'Finished',
    episodes,
  };
}
