import { Anime, Episode } from './types';

export const HENTAI_BASE = 'https://hentaiocean.com';

/**
 * Validates the slug against safe character pattern.
 * Expected pattern: ^[a-z0-9][a-z0-9-_]{0,120}$
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  return /^[a-z0-9][a-z0-9-_]{0,120}$/i.test(trimmed);
}

export interface RawHentaiInfoItem {
  id?: number;
  urlname?: string;
  videoname?: string;
  description?: string;
  releasedate?: string;
  uploaddate?: string;
  coverimg?: string;
  series?: string | null;
  status?: number;
  recentrelease?: number;
}

export interface RawHentaiGenreItem {
  genre?: string;
  name?: string;
}

export interface RawHentaiResponse {
  info?: RawHentaiInfoItem[];
  genres?: (RawHentaiGenreItem | string)[];
}

/**
 * Maps raw Hentai Ocean API response to AniStream's Anime model.
 */
export function mapHentaiResponse(raw: unknown, slug: string): Anime {
  const normalizedSlug = slug.trim().toLowerCase();
  const rawObj = (raw && typeof raw === 'object') ? (raw as RawHentaiResponse) : {};
  const infoList = Array.isArray(rawObj.info) ? rawObj.info : [];
  const info: RawHentaiInfoItem = infoList[0] || {};

  const title = info.videoname?.trim() || slug;
  const japaneseTitle = (info.series && typeof info.series === 'string' && info.series.trim())
    ? info.series.trim()
    : title;
  const synopsis = info.description?.trim() || 'No description available.';

  // Image assets mapping
  const posterImage = info.coverimg
    ? `${HENTAI_BASE}/assets/cover/${info.coverimg}`
    : `${HENTAI_BASE}/thumbnail/${normalizedSlug}.webp`;
  const bannerImage = `${HENTAI_BASE}/thumbnail/${normalizedSlug}.webp`;

  // Genre mapping from [{ genre: "Milf" }, { genre: "Uncensored" }]
  const rawGenres: unknown[] = Array.isArray(rawObj.genres) ? rawObj.genres : [];
  const extractedGenres = rawGenres
    .map((g) => {
      if (typeof g === 'string') return g.trim();
      if (g && typeof g === 'object') {
        const item = g as Record<string, unknown>;
        if (typeof item.genre === 'string') return item.genre.trim();
        if (typeof item.name === 'string') return item.name.trim();
      }
      return '';
    })
    .filter(Boolean);

  const genres = extractedGenres.length > 0 ? extractedGenres : ['Hentai', 'Animation'];

  // Parse release year
  let year = 2024;
  if (info.releasedate) {
    const parsedYear = new Date(info.releasedate).getFullYear();
    if (!isNaN(parsedYear) && parsedYear > 1900) {
      year = parsedYear;
    }
  }

  const animeId = `hentai-${normalizedSlug}`;

  // 1 Episode with embed player URL
  const episodes: Episode[] = [
    {
      id: `${animeId}-ep-1`,
      animeId,
      episodeNumber: 1,
      title: title,
      thumbnail: bannerImage,
      duration: '25:00',
      durationSeconds: 1500,
      videoUrl: '', // empty when embedUrl is active
      embedUrl: `${HENTAI_BASE}/embed/${normalizedSlug}`,
      introStart: 0,
      introEnd: 0,
      synopsis: synopsis,
    },
  ];

  return {
    id: animeId,
    title,
    japaneseTitle,
    synopsis,
    bannerImage,
    posterImage,
    rating: 0, // Unrated by API definition
    rank: 1,
    genres,
    season: info.releasedate ? String(info.releasedate) : `${year}`,
    year,
    studio: info.series || 'Hentai Ocean',
    episodesCount: episodes.length,
    status: 'Finished',
    episodes,
    isFeatured: false,
    isTrending: false,
  };
}
