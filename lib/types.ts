export interface Episode {
  id: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  duration: string;
  durationSeconds: number;
  videoUrl: string;
  embedUrl?: string;
  introStart: number;
  introEnd: number;
  synopsis: string;
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle: string;
  synopsis: string;
  bannerImage: string;
  posterImage: string;
  rating: number;
  rank: number;
  genres: string[];
  season: string;
  year: number;
  studio: string;
  episodesCount: number;
  status: 'Airing' | 'Finished';
  episodes: Episode[];
  isFeatured?: boolean;
  isTrending?: boolean;
}

export type WatchlistStatus = 'watching' | 'plan_to_watch' | 'completed';

export interface WatchlistItem {
  animeId: string;
  status: WatchlistStatus;
  addedAt: number;
  lastEpisodeId?: string;
}

export interface EpisodeProgress {
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: number;
}

export interface EpisodeComment {
  id: string;
  animeId: string;
  episodeId: string;
  author: string;
  avatar: string;
  text: string;
  timestampSeconds?: number;
  likes: number;
  userLiked?: boolean;
  createdAt: string;
}
