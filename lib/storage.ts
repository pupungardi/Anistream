'use client';

import { useState, useEffect } from 'react';
import { Anime, WatchlistItem, EpisodeProgress, EpisodeComment, Episode } from './types';
import { INITIAL_COMMENTS } from './anime-data';
import { getGenreNames } from './utils';

const CATALOG_KEY = 'anistream_user_catalog_v2';
const WATCHLIST_KEY = 'anistream_watchlist_v2';
const PROGRESS_KEY = 'anistream_progress_v2';
const COMMENTS_KEY = 'anistream_comments_v2';

export function sanitizeAnime(item: unknown): Anime {
  const a = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
  const episodes = Array.isArray(a.episodes) ? (a.episodes as Episode[]) : [];
  const genres = getGenreNames(a.genres);

  return {
    id: String(a.id || `anime-${Date.now()}`),
    title: String(a.title || 'Untitled Anime'),
    japaneseTitle: String(a.japaneseTitle || a.title || ''),
    synopsis: String(a.synopsis || ''),
    bannerImage: String(
      a.bannerImage || a.banner || a.posterImage || '/images/hero_anime_cyberpunk_1793706206119.jpg'
    ),
    posterImage: String(
      a.posterImage || a.cover || '/images/poster_shonen_action_1793706206568.jpg'
    ),
    rating: Number(a.rating) || 8.5,
    rank: Number(a.rank) || 1,
    genres: genres.length > 0 ? genres : ['Action'],
    season: String(a.season || '2025'),
    year: Number(a.year) || 2025,
    studio: String(a.studio || 'Studio'),
    episodesCount: episodes.length > 0 ? episodes.length : Number(a.episodesCount) || 1,
    status: a.status === 'Finished' ? 'Finished' : 'Airing',
    isFeatured: Boolean(a.isFeatured),
    isTrending: Boolean(a.isTrending),
    episodes,
  };
}

export function useAnimeStorage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [catalog, setCatalog] = useState<Anime[]>([]);
  const [watchlist, setWatchlist] = useState<Record<string, WatchlistItem>>({});
  const [progress, setProgress] = useState<Record<string, EpisodeProgress>>({});
  const [comments, setComments] = useState<EpisodeComment[]>(INITIAL_COMMENTS);

  // Synchronize state from localStorage on client mount (safe for SSR & hydration)
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const rawCatalog = localStorage.getItem(CATALOG_KEY);
        if (rawCatalog) {
          const parsed = JSON.parse(rawCatalog);
          if (Array.isArray(parsed)) {
            setCatalog(parsed.map(sanitizeAnime));
          }
        }
        const rawWatchlist = localStorage.getItem(WATCHLIST_KEY);
        if (rawWatchlist) {
          setWatchlist(JSON.parse(rawWatchlist));
        }
        const rawProgress = localStorage.getItem(PROGRESS_KEY);
        if (rawProgress) {
          setProgress(JSON.parse(rawProgress));
        }
        const rawComments = localStorage.getItem(COMMENTS_KEY);
        if (rawComments) {
          setComments(JSON.parse(rawComments));
        }
      } catch (err) {
        console.error('Failed to load storage from localStorage:', err);
      } finally {
        setIsHydrated(true);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Add anime to catalog
  const addAnime = (newAnime: Anime) => {
    setCatalog((prev) => {
      const sanitized = sanitizeAnime(newAnime);
      const updated = [sanitized, ...prev.filter((a) => a.id !== sanitized.id)];
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Update existing anime
  const updateAnime = (updatedAnime: Anime) => {
    setCatalog((prev) => {
      const sanitized = sanitizeAnime(updatedAnime);
      const updated = prev.map((a) => (a.id === sanitized.id ? sanitized : a));
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Delete anime from catalog
  const deleteAnime = (animeId: string) => {
    setCatalog((prev) => {
      const updated = prev.filter((a) => a.id !== animeId);
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Also remove from watchlist if present
    setWatchlist((prev) => {
      if (!prev[animeId]) return prev;
      const updated = { ...prev };
      delete updated[animeId];
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Bulk import catalog
  const importCatalog = (imported: Anime[]) => {
    setCatalog(() => {
      const sanitized = Array.isArray(imported) ? imported.map(sanitizeAnime) : [];
      try {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(sanitized));
      } catch (e) {
        console.error(e);
      }
      return sanitized;
    });
  };

  // Clear catalog
  const clearCatalog = () => {
    setCatalog([]);
    try {
      localStorage.removeItem(CATALOG_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // Update watchlist
  const toggleWatchlist = (
    animeId: string,
    status: 'watching' | 'plan_to_watch' | 'completed' = 'watching'
  ) => {
    setWatchlist((prev) => {
      const updated = { ...prev };
      if (updated[animeId]) {
        delete updated[animeId];
      } else {
        updated[animeId] = {
          animeId,
          status,
          addedAt: Date.now(),
        };
      }
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updateWatchlistStatus = (
    animeId: string,
    status: 'watching' | 'plan_to_watch' | 'completed'
  ) => {
    setWatchlist((prev) => {
      const updated = {
        ...prev,
        [animeId]: {
          animeId,
          status,
          addedAt: prev[animeId]?.addedAt || Date.now(),
        },
      };
      try {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isAnimeInWatchlist = (animeId: string) => {
    return Boolean(watchlist[animeId]);
  };

  // Save playback progress
  const updateProgress = (
    episodeId: string,
    progressSeconds: number,
    durationSeconds: number
  ) => {
    setProgress((prev) => {
      const completed = progressSeconds >= durationSeconds * 0.9;
      const updated = {
        ...prev,
        [episodeId]: {
          progressSeconds,
          durationSeconds,
          completed,
          lastWatchedAt: Date.now(),
        },
      };
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Add comment
  const addComment = (
    animeId: string,
    episodeId: string,
    text: string,
    timestampSeconds?: number
  ) => {
    const newComment: EpisodeComment = {
      id: 'c-' + Date.now(),
      animeId,
      episodeId,
      author: 'You (AnimeOtaku)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=YouAnimeOtaku',
      text,
      timestampSeconds,
      likes: 1,
      userLiked: true,
      createdAt: 'Just now',
    };

    setComments((prev) => {
      const updated = [newComment, ...prev];
      try {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Like comment
  const toggleLikeComment = (commentId: string) => {
    setComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = c.userLiked;
          return {
            ...c,
            likes: isLiked ? c.likes - 1 : c.likes + 1,
            userLiked: !isLiked,
          };
        }
        return c;
      });
      try {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  return {
    isHydrated,
    catalog,
    addAnime,
    updateAnime,
    deleteAnime,
    importCatalog,
    clearCatalog,
    watchlist,
    progress,
    comments,
    toggleWatchlist,
    updateWatchlistStatus,
    isAnimeInWatchlist,
    updateProgress,
    addComment,
    toggleLikeComment,
  };
}
