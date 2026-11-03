'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid, StretchHorizontal } from 'lucide-react';
import { Episode, EpisodeProgress } from '../lib/types';

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId: string;
  onSelectEpisode: (episode: Episode) => void;
  progressMap: Record<string, EpisodeProgress>;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  currentEpisodeId,
  onSelectEpisode,
  progressMap,
}) => {
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('vertical');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const current = scrollContainerRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll);
    return () => {
      if (current) {
        current.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [layoutMode, episodes, checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.7;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-3">
      {/* Header with Title, Layout Switcher & Left/Right Scroll Buttons */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <span>Episodes</span>
          <span className="text-xs font-normal text-zinc-500 tabular-nums">
            ({episodes.length})
          </span>
        </h3>

        <div className="flex items-center gap-1.5">
          {/* Mode switch */}
          <button
            onClick={() => setLayoutMode(layoutMode === 'horizontal' ? 'vertical' : 'horizontal')}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title={layoutMode === 'horizontal' ? 'Switch to Vertical list' : 'Switch to Horizontal scroll (Kiri & Kanan)'}
          >
            {layoutMode === 'horizontal' ? (
              <LayoutGrid className="w-3.5 h-3.5" />
            ) : (
              <StretchHorizontal className="w-3.5 h-3.5 text-orange-400" />
            )}
          </button>

          {/* Left / Right scroll buttons when horizontal */}
          {layoutMode === 'horizontal' && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-1 rounded border transition-colors cursor-pointer ${
                  canScrollLeft
                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-40'
                }`}
                title="Scroll Kiri"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-1 rounded border transition-colors cursor-pointer ${
                  canScrollRight
                    ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700'
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-40'
                }`}
                title="Scroll Kanan"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Episode Container */}
      {layoutMode === 'horizontal' ? (
        /* Horizontal Carousel (Scroll Kiri & Kanan) */
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 overflow-x-auto scroll-smooth pb-3 scrollbar-thin scrollbar-thumb-zinc-800 select-none"
        >
          {episodes.map((ep) => {
            const isCurrent = ep.id === currentEpisodeId;
            const progress = progressMap[ep.id];
            const isCompleted = progress?.completed;
            const percent =
              progress && progress.durationSeconds > 0
                ? (progress.progressSeconds / progress.durationSeconds) * 100
                : 0;

            return (
              <button
                key={ep.id}
                onClick={() => onSelectEpisode(ep)}
                className={`w-64 shrink-0 flex flex-col p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-950/30 border-orange-500/80 shadow-md shadow-orange-950/20'
                    : 'bg-[#0e1017] hover:bg-zinc-800/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="relative w-full aspect-video rounded overflow-hidden bg-zinc-900 mb-2">
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[10px] font-mono tabular-nums text-zinc-200">
                    {ep.duration}
                  </span>
                  {isCurrent && (
                    <div className="absolute inset-0 bg-orange-600/40 flex items-center justify-center">
                      <Play className="w-5 h-5 fill-white text-white animate-pulse" />
                    </div>
                  )}
                  {percent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                      <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-orange-400 tabular-nums">
                    EP {ep.episodeNumber}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Watched
                    </span>
                  )}
                </div>

                <h4 className={`text-xs font-semibold truncate mt-0.5 ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                  {ep.title}
                </h4>
              </button>
            );
          })}
        </div>
      ) : (
        /* Vertical List Container */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 max-h-[540px] overflow-y-auto pr-1">
          {episodes.map((ep) => {
            const isCurrent = ep.id === currentEpisodeId;
            const progress = progressMap[ep.id];
            const isCompleted = progress?.completed;
            const percent =
              progress && progress.durationSeconds > 0
                ? (progress.progressSeconds / progress.durationSeconds) * 100
                : 0;

            return (
              <button
                key={ep.id}
                onClick={() => onSelectEpisode(ep)}
                className={`flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-950/30 border-orange-500/80 shadow-md shadow-orange-950/20'
                    : 'bg-[#0e1017] hover:bg-zinc-800/60 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="relative w-28 sm:w-32 aspect-video shrink-0 rounded overflow-hidden bg-zinc-900">
                  <img
                    src={ep.thumbnail}
                    alt={ep.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[10px] font-mono tabular-nums text-zinc-200">
                    {ep.duration}
                  </span>
                  {isCurrent && (
                    <div className="absolute inset-0 bg-orange-600/40 flex items-center justify-center">
                      <Play className="w-5 h-5 fill-white text-white animate-pulse" />
                    </div>
                  )}
                  {percent > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                      <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-orange-400 tabular-nums">
                      EP {ep.episodeNumber}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Watched
                      </span>
                    )}
                  </div>

                  <h4 className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                    {ep.title}
                  </h4>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {ep.synopsis}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
