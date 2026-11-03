'use client';

import React, { useState, useMemo } from 'react';
import { Anime, Episode } from '../lib/types';
import { useAnimeStorage } from '../lib/storage';
import { Navbar } from '../components/Navbar';
import { HeroSpotlight } from '../components/HeroSpotlight';
import { AnimeCard } from '../components/AnimeCard';
import { HorizontalAnimeRow } from '../components/HorizontalAnimeRow';
import { VideoPlayer } from '../components/VideoPlayer';
import { EpisodeList } from '../components/EpisodeList';
import { EpisodeComments } from '../components/EpisodeComments';
import { WatchlistDrawer } from '../components/WatchlistDrawer';
import { SearchModal } from '../components/SearchModal';
import { AnimeDetailModal } from '../components/AnimeDetailModal';
import { AddAnimeModal } from '../components/AddAnimeModal';
import { FilterBar } from '../components/FilterBar';
import { getGenreNames, hasGenre } from '../lib/utils';
import { Sparkles, ArrowLeft, Flame, Compass, Plus, Film, UploadCloud, Layers } from 'lucide-react';

export default function Home() {
  const {
    isHydrated,
    catalog,
    addAnime,
    deleteAnime,
    importCatalog,
    watchlist,
    progress,
    comments,
    toggleWatchlist,
    updateWatchlistStatus,
    isAnimeInWatchlist,
    updateProgress,
    addComment,
    toggleLikeComment,
  } = useAnimeStorage();

  // Active streaming state
  const [activeAnime, setActiveAnime] = useState<Anime | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [jumpToTimestamp, setJumpToTimestamp] = useState<number | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailModalAnime, setDetailModalAnime] = useState<Anime | null>(null);

  // Filtering & View state
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'episodes' | 'newest'>('rating');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');

  // Featured anime for the Hero spotlight (first anime in catalog if exists)
  const featuredAnime = catalog.length > 0 ? catalog[0] : null;

  // Start streaming a specific anime & episode
  const handleStartStreaming = (anime: Anime, episodeIndex = 0) => {
    setActiveAnime(anime);
    const ep = anime.episodes[episodeIndex] || anime.episodes[0];
    setActiveEpisode(ep);
    // Smooth scroll to top of player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to next episode
  const handleNextEpisode = () => {
    if (!activeAnime || !activeEpisode) return;
    const currentIndex = activeAnime.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currentIndex < activeAnime.episodes.length - 1) {
      setActiveEpisode(activeAnime.episodes[currentIndex + 1]);
    }
  };

  // Switch to previous episode
  const handlePrevEpisode = () => {
    if (!activeAnime || !activeEpisode) return;
    const currentIndex = activeAnime.episodes.findIndex((e) => e.id === activeEpisode.id);
    if (currentIndex > 0) {
      setActiveEpisode(activeAnime.episodes[currentIndex - 1]);
    }
  };

  // Surprise Me / Random Anime
  const handleRandomAnime = () => {
    if (catalog.length === 0) {
      setIsAddModalOpen(true);
      return;
    }
    const randomIndex = Math.floor(Math.random() * catalog.length);
    const randomChoice = catalog[randomIndex];
    handleStartStreaming(randomChoice, 0);
  };

  // Close player and return to browsing
  const handleBackToBrowse = () => {
    setActiveAnime(null);
    setActiveEpisode(null);
  };

  // Filtered & Sorted Anime List
  const filteredCatalog = useMemo(() => {
    let result = [...catalog];

    if (selectedGenre === 'Trending') {
      result = result.filter((a) => a.isTrending);
    } else if (selectedGenre !== 'All') {
      result = result.filter((a) => hasGenre(a.genres, selectedGenre));
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'episodes') {
      result.sort((a, b) => b.episodesCount - a.episodesCount);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.year - a.year);
    }

    return result;
  }, [catalog, selectedGenre, sortBy]);

  // Curated genre lists for Horizontal Scrolling Carousels (Scroll Kanan dan Kiri)
  const actionAnime = useMemo(
    () => catalog.filter((a) => hasGenre(a.genres, 'action')),
    [catalog]
  );

  const fantasyAnime = useMemo(
    () => catalog.filter((a) => hasGenre(a.genres, 'fantasy')),
    [catalog]
  );

  const topRatedAnime = useMemo(
    () => [...catalog].sort((a, b) => b.rating - a.rating),
    [catalog]
  );

  // Calculate current episode index and boundaries
  const currentEpisodeIndex = useMemo(() => {
    if (!activeAnime || !activeEpisode) return -1;
    return activeAnime.episodes.findIndex((e) => e.id === activeEpisode.id);
  }, [activeAnime, activeEpisode]);

  const hasNextEpisode =
    activeAnime !== null &&
    currentEpisodeIndex !== -1 &&
    currentEpisodeIndex < activeAnime.episodes.length - 1;

  const hasPrevEpisode = currentEpisodeIndex > 0;

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenAddAnime={() => setIsAddModalOpen(true)}
        watchlistCount={isHydrated ? Object.keys(watchlist).length : 0}
        onSelectGenre={(genre) => {
          setSelectedGenre(genre);
          if (activeAnime) handleBackToBrowse();
        }}
        onRandomAnime={handleRandomAnime}
        onGoHome={handleBackToBrowse}
      />

      {/* Main App Viewport */}
      <main className="flex-1 w-full">
        {!isHydrated ? (
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
              Loading AniStream...
            </span>
          </div>
        ) : activeAnime && activeEpisode ? (
          <div className="w-full">
            {/* Player Breadcrumb & Return Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <button
                onClick={handleBackToBrowse}
                className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Return to Catalog</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">
                  Streaming in <strong className="text-zinc-200">1080p Ultra HD</strong>
                </span>
                <button
                  onClick={() => toggleWatchlist(activeAnime.id)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    isAnimeInWatchlist(activeAnime.id)
                      ? 'bg-zinc-800 text-orange-400 border-orange-500/50'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
                  }`}
                >
                  {isAnimeInWatchlist(activeAnime.id) ? 'Saved in Watchlist' : '+ Watchlist'}
                </button>
              </div>
            </div>

            {/* Video Player Component */}
            <div className={isTheaterMode ? 'w-full bg-black mb-8' : 'px-4 sm:px-6 lg:px-8 mb-8'}>
              <VideoPlayer
                anime={activeAnime}
                episode={activeEpisode}
                onNextEpisode={handleNextEpisode}
                onPrevEpisode={handlePrevEpisode}
                hasNext={hasNextEpisode}
                hasPrev={hasPrevEpisode}
                onProgressUpdate={updateProgress}
                isTheaterMode={isTheaterMode}
                onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
                jumpToTimestamp={jumpToTimestamp}
                onResetJumpTimestamp={() => setJumpToTimestamp(null)}
              />
            </div>

            {/* Player Details & Episodes Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left 2 Columns: Episode Info, Synopsis, Comments */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Episode Header */}
                  <div className="space-y-2 pb-4 border-b border-zinc-800/80">
                    <div className="text-xs font-semibold text-orange-400 uppercase tracking-widest">
                      {activeAnime.japaneseTitle}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      Episode {activeEpisode.episodeNumber}: {activeEpisode.title}
                    </h1>

                    {/* Clean Metadata without Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-medium">
                      <span className="text-zinc-200">{activeAnime.title}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="tabular-nums">Duration: {activeEpisode.duration}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-amber-400 font-semibold tabular-nums">★ {activeAnime.rating.toFixed(1)}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span>{activeAnime.studio}</span>
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                      <span className="text-orange-400">{getGenreNames(activeAnime.genres).join(' / ')}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2">
                      {activeEpisode.synopsis}
                    </p>
                  </div>

                  {/* Episode Comments / Community Reactions */}
                  <EpisodeComments
                    animeId={activeAnime.id}
                    episodeId={activeEpisode.id}
                    episodeNumber={activeEpisode.episodeNumber}
                    comments={comments}
                    onAddComment={addComment}
                    onToggleLike={toggleLikeComment}
                    onJumpToTimestamp={(time) => setJumpToTimestamp(time)}
                  />
                </div>

                {/* Right Column: Episode Queue Drawer with Horizontal / Vertical Toggle */}
                <div className="bg-[#0b0d13] p-4 rounded-xl border border-zinc-800/80 sticky top-20">
                  <EpisodeList
                    episodes={activeAnime.episodes}
                    currentEpisodeId={activeEpisode.id}
                    onSelectEpisode={(ep) => setActiveEpisode(ep)}
                    progressMap={progress}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: DISCOVERY & CATALOG HOME VIEW */
          <div className="space-y-10 pb-20">
            {featuredAnime ? (
              /* Cinematic Hero Spotlight for Top Anime */
              <HeroSpotlight
                anime={featuredAnime}
                onPlayEpisode={(anime, epIdx) => handleStartStreaming(anime, epIdx)}
                onOpenDetails={(anime) => setDetailModalAnime(anime)}
                isInWatchlist={isAnimeInWatchlist(featuredAnime.id)}
                onToggleWatchlist={toggleWatchlist}
              />
            ) : (
              /* Clean Zero-State when Catalog is Empty (with 1-Click Load Sample Anime) */
              <section className="relative w-full overflow-hidden bg-[#0a0c12] border-b border-zinc-800/80 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-500">
                    <Film className="w-8 h-8" />
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Your Anime Library is Ready
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    Your library is empty. Fetch a real title from the HentaiOcean API or import your own JSON collection.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-orange-400" />
                      <span>+ Tambah Anime Manual</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Catalog Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              {/* Filter & Sort Controls + View Mode Switcher (Scroll Kanan/Kiri vs Grid) */}
              {catalog.length > 0 && (
                <FilterBar
                  selectedGenre={selectedGenre}
                  onSelectGenre={setSelectedGenre}
                  sortBy={sortBy}
                  onSelectSort={setSortBy}
                  totalCount={filteredCatalog.length}
                  viewMode={viewMode}
                  onToggleViewMode={setViewMode}
                />
              )}

              {/* VIEW MODE 1: HORIZONTAL SCROLLING ROWS (SCROLL KANAN DAN KIRI) */}
              {catalog.length > 0 && viewMode === 'carousel' && (
                <div className="space-y-12">
                  {/* Row 1: Filtered or Main Carousel */}
                  <HorizontalAnimeRow
                    title={selectedGenre === 'All' ? 'Trending & Popular Anime' : `${selectedGenre} Series`}
                    subtitle="Geser atau klik tombol panah untuk scroll kanan dan kiri"
                    icon={<Flame className="w-5 h-5 text-orange-500" />}
                    animeList={filteredCatalog}
                    onSelectAnime={(a) => setDetailModalAnime(a)}
                    onQuickPlay={(a) => handleStartStreaming(a, 0)}
                    isAnimeInWatchlist={isAnimeInWatchlist}
                    onToggleWatchlist={toggleWatchlist}
                    progressMap={progress}
                  />

                  {/* Row 2: Action & Shonen (Scroll Kanan dan Kiri) */}
                  {selectedGenre === 'All' && actionAnime.length > 0 && (
                    <HorizontalAnimeRow
                      title="Action & Shonen Hits"
                      subtitle="Pertarungan epik dan petualangan supernatural"
                      icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                      animeList={actionAnime}
                      onSelectAnime={(a) => setDetailModalAnime(a)}
                      onQuickPlay={(a) => handleStartStreaming(a, 0)}
                      isAnimeInWatchlist={isAnimeInWatchlist}
                      onToggleWatchlist={toggleWatchlist}
                      progressMap={progress}
                    />
                  )}

                  {/* Row 3: Fantasy & World Adventure (Scroll Kanan dan Kiri) */}
                  {selectedGenre === 'All' && fantasyAnime.length > 0 && (
                    <HorizontalAnimeRow
                      title="Fantasy & Supernatural Worlds"
                      subtitle="Sihir kuno dan dimensi misterius"
                      icon={<Compass className="w-5 h-5 text-sky-400" />}
                      animeList={fantasyAnime}
                      onSelectAnime={(a) => setDetailModalAnime(a)}
                      onQuickPlay={(a) => handleStartStreaming(a, 0)}
                      isAnimeInWatchlist={isAnimeInWatchlist}
                      onToggleWatchlist={toggleWatchlist}
                      progressMap={progress}
                    />
                  )}

                  {/* Row 4: Top Rated Classics (Scroll Kanan dan Kiri) */}
                  {selectedGenre === 'All' && topRatedAnime.length > 0 && (
                    <HorizontalAnimeRow
                      title="Rating Tertinggi (Top Rated)"
                      subtitle="Anime dengan skor ulasan tertinggi dari penonton"
                      icon={<Layers className="w-5 h-5 text-emerald-400" />}
                      animeList={topRatedAnime}
                      onSelectAnime={(a) => setDetailModalAnime(a)}
                      onQuickPlay={(a) => handleStartStreaming(a, 0)}
                      isAnimeInWatchlist={isAnimeInWatchlist}
                      onToggleWatchlist={toggleWatchlist}
                      progressMap={progress}
                    />
                  )}
                </div>
              )}

              {/* VIEW MODE 2: TRADITIONAL GRID VIEW */}
              {catalog.length > 0 && viewMode === 'grid' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{selectedGenre === 'All' ? 'All Anime Series' : `${selectedGenre} Anime`}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredCatalog.map((anime) => {
                      const firstEpId = anime.episodes[0]?.id;
                      const epProg = firstEpId ? progress[firstEpId] : undefined;
                      const percent =
                        epProg && epProg.durationSeconds > 0
                          ? (epProg.progressSeconds / epProg.durationSeconds) * 100
                          : undefined;

                      return (
                        <AnimeCard
                          key={anime.id}
                          anime={anime}
                          onSelect={(a) => setDetailModalAnime(a)}
                          onQuickPlay={(a) => handleStartStreaming(a, 0)}
                          isInWatchlist={isAnimeInWatchlist(anime.id)}
                          onToggleWatchlist={toggleWatchlist}
                          watchProgressPercent={percent}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#060709] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </span>
            <span className="font-semibold text-zinc-300">AniStream</span>
            <span>·</span>
            <span>Platform Streaming Anime dengan Carousel Horizontal</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
            >
              + Add Anime
            </button>
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              My Watchlist
            </button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} AniStream.
          </div>
        </div>
      </footer>

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        catalog={catalog}
        onSelectAnime={(anime) => setDetailModalAnime(anime)}
        onPlayAnime={(anime) => handleStartStreaming(anime, 0)}
      />

      {/* Watchlist Slide-Over Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        animeList={catalog}
        onPlayAnime={(anime) => handleStartStreaming(anime, 0)}
        onRemoveFromWatchlist={toggleWatchlist}
        onUpdateStatus={updateWatchlistStatus}
      />

      {/* Anime Detail Modal */}
      <AnimeDetailModal
        anime={detailModalAnime}
        onClose={() => setDetailModalAnime(null)}
        onPlayEpisode={(anime, idx) => handleStartStreaming(anime, idx)}
        isInWatchlist={detailModalAnime ? isAnimeInWatchlist(detailModalAnime.id) : false}
        onToggleWatchlist={toggleWatchlist}
        onDeleteAnime={deleteAnime}
      />

      {/* Add Anime Series Modal */}
      <AddAnimeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAnime={addAnime}
        onImportCatalog={importCatalog}
      />
    </div>
  );
}
