'use client';

import React, { useState } from 'react';
import { X, Play, Trash2, Bookmark } from 'lucide-react';
import { Anime, WatchlistItem, WatchlistStatus } from '../lib/types';
import { getGenreNames } from '../lib/utils';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: Record<string, WatchlistItem>;
  animeList: Anime[];
  onPlayAnime: (anime: Anime) => void;
  onRemoveFromWatchlist: (animeId: string) => void;
  onUpdateStatus: (animeId: string, status: WatchlistStatus) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  animeList,
  onPlayAnime,
  onRemoveFromWatchlist,
  onUpdateStatus,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | WatchlistStatus>('all');

  if (!isOpen) return null;

  const watchlistEntries = Object.values(watchlist);
  const filteredEntries = watchlistEntries.filter((item) => {
    if (filterTab === 'all') return true;
    return item.status === filterTab;
  });

  const getAnime = (animeId: string) => animeList.find((a) => a.id === animeId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-[#0a0c12] border-l border-zinc-800 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-orange-500 fill-orange-500/20" />
            <h2 className="text-base font-bold text-white">My Watchlist</h2>
            <span className="text-xs text-zinc-500 tabular-nums">
              ({watchlistEntries.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters (Clean segmented control buttons) */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'all'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('watching')}
              className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'watching'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Watching
            </button>
            <button
              onClick={() => setFilterTab('plan_to_watch')}
              className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'plan_to_watch'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Plan
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`py-1.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                filterTab === 'completed'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Done
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Bookmark className="w-10 h-10 text-zinc-700" />
              <p className="text-sm text-zinc-400 font-medium">No anime in this section yet</p>
              <p className="text-xs text-zinc-600 max-w-xs">
                Browse series from the catalog and click the bookmark button to save them here.
              </p>
            </div>
          ) : (
            filteredEntries.map((item) => {
              const anime = getAnime(item.animeId);
              if (!anime) return null;

              return (
                <div
                  key={item.animeId}
                  className="flex gap-3 p-3 bg-[#11131b] border border-zinc-800/80 rounded-lg hover:border-zinc-700 transition-colors"
                >
                  <img
                    src={anime.posterImage}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-22 object-cover rounded bg-zinc-900 shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        {anime.title}
                      </h4>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {getGenreNames(anime.genres).join(' · ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      {/* Status selector */}
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(anime.id, e.target.value as WatchlistStatus)}
                        className="bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Plan to Watch</option>
                        <option value="completed">Completed</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onPlayAnime(anime);
                            onClose();
                          }}
                          className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors cursor-pointer"
                          title="Stream Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </button>
                        <button
                          onClick={() => onRemoveFromWatchlist(anime.id)}
                          className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
