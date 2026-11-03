'use client';

import React from 'react';
import { Search, Bookmark, Sparkles, Film, Compass, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  onOpenAddAnime: () => void;
  watchlistCount: number;
  onSelectGenre: (genre: string) => void;
  onRandomAnime: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenWatchlist,
  onOpenAddAnime,
  watchlistCount,
  onSelectGenre,
  onRandomAnime,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080a]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-600/30 group-hover:bg-orange-500 transition-colors">
            A
          </span>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            Ani<span className="text-orange-500">Stream</span>
          </span>
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
          <button
            onClick={onGoHome}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-orange-400" />
            Discover
          </button>
          <button
            onClick={() => onSelectGenre('Trending')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Trending
          </button>
          <button
            onClick={() => onSelectGenre('Action')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Film className="w-4 h-4 text-zinc-400" />
            Action & Shonen
          </button>
          <button
            onClick={() => onSelectGenre('Sci-Fi')}
            className="hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            Sci-Fi & Mecha
          </button>
          <button
            onClick={onRandomAnime}
            className="hover:text-orange-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Surprise Me
          </button>
        </nav>

        {/* Zone 3: Action group (Add Anime, Search trigger & Watchlist) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenAddAnime}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 rounded-md transition-all cursor-pointer whitespace-nowrap"
            title="Add your anime series"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Add Anime</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-md transition-all cursor-pointer whitespace-nowrap"
            title="Search anime (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] text-zinc-500 bg-zinc-800/80 rounded border border-zinc-700/60 font-mono">
              /
            </kbd>
          </button>

          <button
            onClick={onOpenWatchlist}
            className="relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-md shadow-orange-600/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 fill-white/20" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="tabular-nums px-1.5 py-0.2 text-[11px] font-bold bg-white text-orange-600 rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
