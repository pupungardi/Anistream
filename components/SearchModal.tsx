'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Play, Star } from 'lucide-react';
import { Anime } from '../lib/types';
import { getGenreNames, hasGenre } from '../lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onPlayAnime: (anime: Anime) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectAnime,
  onPlayAnime,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();
  const filtered = cleanQuery
    ? catalog.filter(
        (a) =>
          a.title.toLowerCase().includes(cleanQuery) ||
          a.japaneseTitle.toLowerCase().includes(cleanQuery) ||
          hasGenre(a.genres, cleanQuery) ||
          a.studio.toLowerCase().includes(cleanQuery)
      )
    : catalog.slice(0, 5); // default trending suggestions

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0d0f17] border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-800">
          <Search className="w-5 h-5 text-orange-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime series, genres (e.g. Cyberpunk, Action), or studios..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-xs text-zinc-500 bg-zinc-800 rounded border border-zinc-700/70 font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {query ? `Results (${filtered.length})` : 'Popular & Trending'}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              No anime found matching &quot;{query}&quot;. Try searching for &quot;Action&quot; or &quot;Mecha&quot;.
            </div>
          ) : (
            filtered.map((anime) => (
              <div
                key={anime.id}
                onClick={() => {
                  onSelectAnime(anime);
                  handleClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#121520] hover:bg-zinc-800/80 border border-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={anime.posterImage}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 object-cover rounded bg-zinc-900 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                      {anime.title}
                    </h4>
                    <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {anime.japaneseTitle}
                    </div>
                    {/* Unboxed metadata format */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                      <span className="flex items-center gap-1 text-amber-400 font-medium tabular-nums">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {anime.rating.toFixed(1)}
                      </span>
                      <span>·</span>
                      <span>{anime.year}</span>
                      <span>·</span>
                      <span className="text-zinc-400">{getGenreNames(anime.genres).slice(0, 2).join(' / ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-3 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAnime(anime);
                      handleClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
