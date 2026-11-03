'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime, EpisodeProgress } from '../lib/types';
import { AnimeCard } from './AnimeCard';

interface HorizontalAnimeRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onQuickPlay: (anime: Anime) => void;
  isAnimeInWatchlist: (animeId: string) => boolean;
  onToggleWatchlist: (animeId: string) => void;
  progressMap: Record<string, EpisodeProgress>;
}

export const HorizontalAnimeRow: React.FC<HorizontalAnimeRowProps> = ({
  title,
  subtitle,
  icon,
  animeList,
  onSelectAnime,
  onQuickPlay,
  isAnimeInWatchlist,
  onToggleWatchlist,
  progressMap,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [thumbWidthRatio, setThumbWidthRatio] = useState(0.25); // fraction of visible content

  // Check scroll boundary and calculate relative scroll progress
  const updateScrollMetrics = useCallback(() => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0;
    setScrollProgress(progress);

    const ratio = scrollWidth > 0 ? Math.min(1, Math.max(0.12, clientWidth / scrollWidth)) : 0.25;
    setThumbWidthRatio(ratio);
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    const current = rowRef.current;
    if (current) {
      current.addEventListener('scroll', updateScrollMetrics, { passive: true });
    }
    window.addEventListener('resize', updateScrollMetrics);
    return () => {
      if (current) {
        current.removeEventListener('scroll', updateScrollMetrics);
      }
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, [animeList, updateScrollMetrics]);

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Click on the progress bar track to scrub / seek horizontal scroll position
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !rowRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const { scrollWidth, clientWidth } = rowRef.current;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    rowRef.current.scrollTo({
      left: ratio * maxScroll,
      behavior: 'smooth',
    });
  };

  if (animeList.length === 0) return null;

  const indicatorWidthPercent = Math.max(15, thumbWidthRatio * 100);
  const indicatorLeftPercent = scrollProgress * (100 - indicatorWidthPercent);

  return (
    <div className="space-y-3 group/row relative">
      {/* Row Header with Title, Visual Scroll Progress Indicator, & Scroll Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            {icon}
            <span>{title}</span>
            <span className="text-xs font-normal text-zinc-500 tabular-nums">
              ({animeList.length})
            </span>
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Visual Progress Indicator + Scroll Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Visual Scroll Position Indicator */}
          <div className="flex items-center gap-2">
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              className="relative w-20 sm:w-28 md:w-36 h-2 bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-800/80 cursor-pointer overflow-hidden transition-colors"
              title={`Posisi scroll: ${Math.round(scrollProgress * 100)}% (Klik untuk lompat)`}
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full shadow-sm shadow-orange-500/30 transition-all duration-150 ease-out"
                style={{
                  width: `${indicatorWidthPercent}%`,
                  left: `${indicatorLeftPercent}%`,
                }}
              />
            </div>

            <span className="text-[11px] font-mono tabular-nums text-zinc-400 min-w-[32px] text-right hidden sm:inline-block">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* Left & Right Scroll Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700/80 shadow-md active:scale-95'
                  : 'bg-zinc-950/60 text-zinc-600 border-zinc-800/40 cursor-not-allowed opacity-40'
              }`}
              title="Scroll Kiri (Left)"
              aria-label="Scroll Kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700/80 shadow-md active:scale-95'
                  : 'bg-zinc-950/60 text-zinc-600 border-zinc-800/40 cursor-not-allowed opacity-40'
              }`}
              title="Scroll Kanan (Right)"
              aria-label="Scroll Kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container (Scroll Kanan dan Kiri) */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent select-none"
        style={{
          scrollbarGutter: 'stable',
        }}
      >
        {animeList.map((anime) => {
          const firstEpId = anime.episodes[0]?.id;
          const epProg = firstEpId ? progressMap[firstEpId] : undefined;
          const percent =
            epProg && epProg.durationSeconds > 0
              ? (epProg.progressSeconds / epProg.durationSeconds) * 100
              : undefined;

          return (
            <div
              key={anime.id}
              className="w-44 sm:w-48 md:w-56 shrink-0 transition-transform duration-200"
            >
              <AnimeCard
                anime={anime}
                onSelect={onSelectAnime}
                onQuickPlay={onQuickPlay}
                isInWatchlist={isAnimeInWatchlist(anime.id)}
                onToggleWatchlist={onToggleWatchlist}
                watchProgressPercent={percent}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
