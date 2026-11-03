'use client';

import React from 'react';
import { ArrowUpDown, StretchHorizontal, LayoutGrid } from 'lucide-react';

interface FilterBarProps {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  sortBy: 'rating' | 'episodes' | 'newest';
  onSelectSort: (sort: 'rating' | 'episodes' | 'newest') => void;
  totalCount: number;
  viewMode?: 'carousel' | 'grid';
  onToggleViewMode?: (mode: 'carousel' | 'grid') => void;
}

const GENRES = ['All', 'Trending', 'Action', 'Sci-Fi', 'Fantasy', 'Shonen'];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSelectSort,
  totalCount,
  viewMode = 'carousel',
  onToggleViewMode,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-zinc-800/80">
      {/* Genre Filter Tabs (Functional segmented control buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-orange-600 text-white font-semibold shadow-sm shadow-orange-600/30'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
              }`}
            >
              {genre === 'All' ? 'All Catalog' : genre}
            </button>
          );
        })}
      </div>

      {/* Right controls: View Switcher (Scroll Kanan/Kiri vs Grid), Count & Sort */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="text-xs text-zinc-400 tabular-nums">
          <strong className="text-zinc-200">{totalCount}</strong> series
        </span>

        {/* View Mode Toggle: Scroll Horizontal vs Grid */}
        {onToggleViewMode && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onToggleViewMode('carousel')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tampilan Carousel Horizontal (Scroll Kanan dan Kiri)"
            >
              <StretchHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Scroll Kiri/Kanan</span>
            </button>

            <button
              onClick={() => onToggleViewMode('grid')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Grid</span>
            </button>
          </div>
        )}

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
          <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
          <select
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value as 'rating' | 'episodes' | 'newest')}
            className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="rating" className="bg-zinc-900">Top Rated</option>
            <option value="episodes" className="bg-zinc-900">Episode Count</option>
            <option value="newest" className="bg-zinc-900">Newest</option>
          </select>
        </div>
      </div>
    </div>
  );
};
