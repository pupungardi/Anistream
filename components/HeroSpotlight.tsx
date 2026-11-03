'use client';

import React from 'react';
import { Play, Bookmark, Info, Star } from 'lucide-react';
import { Anime } from '../lib/types';
import { getGenreNames } from '../lib/utils';

interface HeroSpotlightProps {
  anime: Anime;
  onPlayEpisode: (anime: Anime, episodeIndex?: number) => void;
  onOpenDetails: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (animeId: string) => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({
  anime,
  onPlayEpisode,
  onOpenDetails,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#07080a] border-b border-zinc-800/80">
      {/* Background Banner with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={anime.bannerImage}
          alt={anime.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-700 ease-out"
        />
        {/* Dark radial and gradient scrims ensuring legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080a] via-[#07080a]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080a] via-[#07080a]/65 to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-2xl space-y-4">
          {/* Subtle Japanese Title Kicker */}
          <div className="text-sm font-medium tracking-widest text-orange-400/90 uppercase">
            {anime.japaneseTitle}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
            {anime.title}
          </h1>

          {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Rule) */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
            <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {anime.rating > 0 ? anime.rating.toFixed(1) : '–'}
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="tabular-nums">{anime.episodesCount} Episodes</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{anime.season}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>{anime.studio}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-orange-400">{getGenreNames(anime.genres).join(' / ')}</span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed line-clamp-3 md:line-clamp-4">
            {anime.synopsis}
          </p>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onPlayEpisode(anime, 0)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 active:scale-95 rounded-lg shadow-lg shadow-orange-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Episode 1</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(anime.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                isInWatchlist
                  ? 'bg-zinc-800/90 border-orange-500/60 text-orange-400'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-orange-400' : ''}`} />
              <span>{isInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={() => onOpenDetails(anime)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Info className="w-4 h-4" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
