'use client';

import React from 'react';
import { Play, Bookmark, Star } from 'lucide-react';
import { Anime } from '../lib/types';
import { getGenreNames } from '../lib/utils';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  onQuickPlay: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (animeId: string) => void;
  watchProgressPercent?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onQuickPlay,
  isInWatchlist,
  onToggleWatchlist,
  watchProgressPercent,
}) => {
  return (
    <div className="group relative flex flex-col bg-[#0e1017] border border-zinc-800/80 hover:border-zinc-700 rounded-lg overflow-hidden transition-all duration-200">
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 cursor-pointer" onClick={() => onSelect(anime)}>
        <img
          src={anime.posterImage}
          alt={anime.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickPlay(anime);
            }}
            className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Play Episode 1"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>

        {/* Bookmark quick toggle in top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(anime.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-md backdrop-blur-md transition-all cursor-pointer ${
            isInWatchlist
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/80'
          }`}
          title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-white' : ''}`} />
        </button>

        {/* Top left rating text (Clean unboxed style) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 bg-black/75 backdrop-blur-md rounded text-xs font-semibold text-amber-400 tabular-nums">
          <Star className="w-3 h-3 fill-amber-400" />
          {anime.rating > 0 ? anime.rating.toFixed(1) : '–'}
        </div>

        {/* Watch Progress bar if active */}
        {watchProgressPercent !== undefined && watchProgressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${Math.min(100, watchProgressPercent)}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-1.5 cursor-pointer" onClick={() => onSelect(anime)}>
        <div>
          <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-1">
            {anime.title}
          </h3>
          <div className="text-[11px] text-zinc-500 line-clamp-1">
            {anime.japaneseTitle}
          </div>
        </div>

        {/* Metadata in unboxed text format with separators */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium pt-1">
          <span className="tabular-nums">{anime.episodesCount} Ep</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>{anime.year}</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span className="text-zinc-400 truncate">{getGenreNames(anime.genres)[0] || 'Anime'}</span>
        </div>
      </div>
    </div>
  );
};
