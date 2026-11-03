'use client';

import React from 'react';
import { X, Play, Bookmark, Star, Calendar, Layers, Trash2 } from 'lucide-react';
import { Anime, Episode } from '../lib/types';
import { getGenreNames } from '../lib/utils';

interface AnimeDetailModalProps {
  anime: Anime | null;
  onClose: () => void;
  onPlayEpisode: (anime: Anime, episodeIndex: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (animeId: string) => void;
  onDeleteAnime?: (animeId: string) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  onClose,
  onPlayEpisode,
  isInWatchlist,
  onToggleWatchlist,
  onDeleteAnime,
}) => {
  if (!anime) return null;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${anime.title}" from your catalog?`)) {
      if (onDeleteAnime) {
        onDeleteAnime(anime.id);
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#0d0f17] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Backdrop Banner */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-zinc-900 shrink-0">
          <img
            src={anime.bannerImage}
            alt={anime.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlay titles */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="text-xs font-semibold text-orange-400 uppercase tracking-widest">
              {anime.japaneseTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {anime.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Row (Clean unboxed style) */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300">
            <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
              <Star className="w-4 h-4 fill-amber-400" />
              {anime.rating > 0 ? `${anime.rating.toFixed(1)} / 10` : 'Unrated'}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Layers className="w-4 h-4 text-zinc-400" />
              {anime.episodesCount} Episodes
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {anime.season}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400">Studio: <strong className="text-zinc-200">{anime.studio}</strong></span>
          </div>

          {/* Genres Line */}
          <div className="text-xs text-orange-400 font-medium">
            Genres: {getGenreNames(anime.genres).join(' · ')}
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-sm font-bold text-white mb-1.5">Synopsis</h3>
            <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed">
              {anime.synopsis}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onPlayEpisode(anime, 0);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Episode 1</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(anime.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                  isInWatchlist
                    ? 'bg-zinc-800 border-orange-500/80 text-orange-400'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-orange-400' : ''}`} />
                <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>

            {onDeleteAnime && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                title="Remove from catalog"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Series</span>
              </button>
            )}
          </div>

          {/* Episodes List in Modal */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-white">Episodes ({anime.episodes.length})</h3>
            <div className="space-y-2">
              {anime.episodes.map((ep: Episode, idx: number) => (
                <div
                  key={ep.id}
                  onClick={() => {
                    onPlayEpisode(anime, idx);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 bg-[#11141e] hover:bg-zinc-800/80 border border-zinc-800/80 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-orange-400 tabular-nums w-6">
                      #{ep.episodeNumber}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-orange-400 transition-colors">
                        {ep.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">
                        {ep.synopsis}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                      {ep.duration}
                    </span>
                    <button className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-orange-600 text-white flex items-center justify-center transition-colors">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
