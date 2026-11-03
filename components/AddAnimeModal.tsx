'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Film, UploadCloud, Check, Search, Download } from 'lucide-react';
import { Anime, Episode } from '../lib/types';
import { getGenreNames, fetchHentaiData } from '../lib/utils';

interface AddAnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnime: (anime: Anime) => void;
  onImportCatalog?: (catalog: Anime[]) => void;
}

const DEFAULT_POSTER = '/images/poster_shonen_action_1793706206568.jpg';
const DEFAULT_BANNER = '/images/hero_anime_cyberpunk_1793706206119.jpg';

export const AddAnimeModal: React.FC<AddAnimeModalProps> = ({
  isOpen,
  onClose,
  onAddAnime,
  onImportCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'slug' | 'json'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [japaneseTitle, setJapaneseTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [posterImage, setPosterImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [genresInput, setGenresInput] = useState('Action, Shonen');
  const [studio, setStudio] = useState('Studio MAPPA');
  const [year, setYear] = useState('2025');
  const [rating, setRating] = useState('8.8');
  const [status, setStatus] = useState<'Airing' | 'Finished'>('Airing');

  // Slug Fetch State
  const [slugQuery, setSlugQuery] = useState('');
  const [isFetchingSlug, setIsFetchingSlug] = useState(false);
  const [slugFetchError, setSlugFetchError] = useState<string | null>(null);
  const [fetchedAnimeData, setFetchedAnimeData] = useState<Anime | null>(null);

  // Episodes List
  const [episodes, setEpisodes] = useState<
    Array<{
      title: string;
      videoUrl: string;
      duration: string;
      introStart: number;
      introEnd: number;
      synopsis: string;
    }>
  >([
    {
      title: 'Episode 1: Awakening',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: '12:14',
      introStart: 10,
      introEnd: 90,
      synopsis: 'The beginning of the journey.',
    },
  ]);

  // JSON Import State
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddEpisodeRow = () => {
    setEpisodes((prev) => [
      ...prev,
      {
        title: `Episode ${prev.length + 1}`,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        duration: '14:20',
        introStart: 10,
        introEnd: 90,
        synopsis: '',
      },
    ]);
  };

  const handleRemoveEpisodeRow = (index: number) => {
    if (episodes.length === 1) return;
    setEpisodes((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleEpisodeChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setEpisodes((prev) =>
      prev.map((ep, idx) => (idx === index ? { ...ep, [field]: value } : ep))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const animeId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `anime-${Date.now()}`;

    const parsedGenres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);

    const formattedEpisodes: Episode[] = episodes.map((ep, idx) => ({
      id: `${animeId}-ep-${idx + 1}`,
      animeId,
      episodeNumber: idx + 1,
      title: ep.title.trim() || `Episode ${idx + 1}`,
      thumbnail: posterImage.trim() || DEFAULT_POSTER,
      duration: ep.duration.trim() || '24:00',
      durationSeconds: 1440,
      videoUrl: ep.videoUrl.trim(),
      introStart: Number(ep.introStart) || 0,
      introEnd: Number(ep.introEnd) || 90,
      synopsis: ep.synopsis.trim() || `Episode ${idx + 1} synopsis.`,
    }));

    const newAnime: Anime = {
      id: animeId,
      title: title.trim(),
      japaneseTitle: japaneseTitle.trim() || title.trim(),
      synopsis: synopsis.trim() || 'No synopsis provided.',
      posterImage: posterImage.trim() || DEFAULT_POSTER,
      bannerImage: bannerImage.trim() || posterImage.trim() || DEFAULT_BANNER,
      rating: parseFloat(rating) || 8.5,
      rank: 1,
      genres: parsedGenres.length > 0 ? parsedGenres : ['Action'],
      season: '2025',
      year: parseInt(year) || 2025,
      studio: studio.trim() || 'Animation Studio',
      episodesCount: formattedEpisodes.length,
      status,
      episodes: formattedEpisodes,
      isFeatured: true,
      isTrending: true,
    };

    onAddAnime(newAnime);
    onClose();
  };

  const handleFetchBySlug = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slugQuery.trim().toLowerCase();
    if (!cleanSlug) return;

    setIsFetchingSlug(true);
    setSlugFetchError(null);
    setFetchedAnimeData(null);

    try {
      // First attempt local /api/anime route
      let formatted: Anime | null = null;
      try {
        const res = await fetch(`/api/anime?slug=${encodeURIComponent(cleanSlug)}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const item = data.data;
          formatted = {
            id: item.slug,
            title: item.title,
            japaneseTitle: item.japaneseTitle,
            synopsis: item.synopsis,
            posterImage: item.cover,
            bannerImage: item.banner,
            rating: item.rating,
            rank: 1,
            genres: getGenreNames(item.genres),
            season: item.dates?.season || '2025',
            year: item.dates?.year || 2025,
            studio: item.studio,
            episodesCount: item.episodesCount,
            status: item.status || 'Finished',
            episodes: item.episodes.map((ep: Episode) => ({
              ...ep,
              animeId: item.slug,
              durationSeconds: 1440,
              synopsis: ep.title,
            })),
          };
        }
      } catch {
        // Fallback to fetchHentaiData utility
      }

      // If not resolved from internal endpoint, try fetchHentaiData directly
      if (!formatted) {
        try {
          formatted = await fetchHentaiData(cleanSlug);
        } catch (fetchErr: any) {
          setSlugFetchError(fetchErr?.message || 'Failed to fetch anime by slug');
          return;
        }
      }

      setFetchedAnimeData(formatted);
    } catch {
      setSlugFetchError('Network error while fetching anime endpoint');
    } finally {
      setIsFetchingSlug(false);
    }
  };

  const handleApplyFetchedAnime = () => {
    if (!fetchedAnimeData) return;
    onAddAnime(fetchedAnimeData);
    onClose();
  };

  const handleJsonImport = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput.trim());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0) {
        setJsonError('JSON array is empty.');
        return;
      }
      if (onImportCatalog) {
        onImportCatalog(list as Anime[]);
      }
      onClose();
    } catch {
      setJsonError('Invalid JSON format. Please paste valid anime array JSON.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0d0f17] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-white">Add Anime Series</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'form' ? 'bg-orange-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('slug')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'slug' ? 'bg-orange-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Fetch API
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'json' ? 'bg-orange-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Import JSON
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'slug' ? (
            /* Fetch by Slug Tab */
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Fetch Anime Data by Slug
                </h3>
                <p className="text-xs text-zinc-400">
                  Retrieve title, release dates, genres, cover images, and episode streams via the API endpoint.
                </p>
              </div>

              <form onSubmit={handleFetchBySlug} className="flex gap-2">
                <input
                  type="text"
                  value={slugQuery}
                  onChange={(e) => setSlugQuery(e.target.value)}
                  placeholder="e.g. solo-leveling, attack-on-titan, jujutsu-kaisen..."
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isFetchingSlug || !slugQuery.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-40 rounded-lg shadow cursor-pointer whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isFetchingSlug ? 'Fetching...' : 'Fetch Slug'}</span>
                </button>
              </form>

              {/* Sample Slugs quick tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="text-zinc-500">Suggested slugs:</span>
                {['solo-leveling', 'attack-on-titan', 'jujutsu-kaisen', 'frieren-journey', 'cyberpunk-edgerunners'].map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlugQuery(s)}
                      className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-orange-400 rounded cursor-pointer font-mono"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>

              {slugFetchError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300">
                  {slugFetchError}
                </div>
              )}

              {fetchedAnimeData && (
                <div className="p-4 bg-[#11141e] border border-zinc-700/80 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex gap-3">
                    <img
                      src={fetchedAnimeData.posterImage}
                      alt={fetchedAnimeData.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-24 object-cover rounded bg-zinc-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-[11px] font-semibold text-orange-400 uppercase">
                        {fetchedAnimeData.japaneseTitle}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {fetchedAnimeData.title}
                      </h4>
                      <div className="text-xs text-zinc-400">
                        <span>{fetchedAnimeData.year}</span> · <span>{fetchedAnimeData.studio}</span> ·{' '}
                        <span>★ {fetchedAnimeData.rating}</span>
                      </div>
                      <div className="text-xs text-orange-400">
                        {fetchedAnimeData.genres.join(' · ')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {fetchedAnimeData.synopsis}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                    <span className="text-xs text-zinc-400 tabular-nums">
                      {fetchedAnimeData.episodes.length} Episodes Ready
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyFetchedAnime}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Add to Library</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'form' ? (
            /* Manual Form Tab */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Anime Title <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Solo Leveling"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Japanese / Romaji Title
                  </label>
                  <input
                    type="text"
                    value={japaneseTitle}
                    onChange={(e) => setJapaneseTitle(e.target.value)}
                    placeholder="e.g. 俺だけレベルアップな件"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Synopsis / Description
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Summary of the anime series..."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Poster Image URL
                  </label>
                  <input
                    type="url"
                    value={posterImage}
                    onChange={(e) => setPosterImage(e.target.value)}
                    placeholder="https://... (or leave blank for default poster)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Banner Backdrop URL
                  </label>
                  <input
                    type="url"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://... (or leave blank)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Genres
                  </label>
                  <input
                    type="text"
                    value={genresInput}
                    onChange={(e) => setGenresInput(e.target.value)}
                    placeholder="Action, Fantasy"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Studio
                  </label>
                  <input
                    type="text"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    placeholder="Studio MAPPA"
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Episodes Section */}
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Episodes ({episodes.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEpisodeRow}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-orange-400 hover:text-white bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Episode</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {episodes.map((ep, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#121520] border border-zinc-800 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-orange-500">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ep.title}
                          onChange={(e) => handleEpisodeChange(idx, 'title', e.target.value)}
                          placeholder={`Episode ${idx + 1} Title`}
                          className="flex-1 px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                        {episodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEpisodeRow(idx)}
                            className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer"
                            title="Remove episode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="url"
                          required
                          value={ep.videoUrl}
                          onChange={(e) => handleEpisodeChange(idx, 'videoUrl', e.target.value)}
                          placeholder="Video stream URL (MP4 / WebM / HLS)"
                          className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ep.duration}
                            onChange={(e) => handleEpisodeChange(idx, 'duration', e.target.value)}
                            placeholder="Duration (e.g. 24:15)"
                            className="w-1/2 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white focus:outline-none font-mono"
                          />
                          <input
                            type="number"
                            value={ep.introEnd}
                            onChange={(e) => handleEpisodeChange(idx, 'introEnd', Number(e.target.value))}
                            placeholder="Intro sec (90)"
                            title="Skip Intro end second"
                            className="w-1/2 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-xs text-white focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Submit Footer */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save to Catalog</span>
                </button>
              </div>
            </form>
          ) : (
            /* JSON Import Tab */
            <form onSubmit={handleJsonImport} className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Paste an array of anime objects matching the Anime schema. This allows you to import entire playlists or backups at once.
              </p>

              {jsonError && (
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg text-xs text-red-300">
                  {jsonError}
                </div>
              )}

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'[\n  {\n    "id": "my-anime",\n    "title": "My Anime Title",\n    "japaneseTitle": "タイトル",\n    "synopsis": "...",\n    "posterImage": "https://...",\n    "bannerImage": "https://...",\n    "rating": 9.2,\n    "genres": ["Action"],\n    "year": 2025,\n    "studio": "Studio",\n    "episodesCount": 1,\n    "episodes": [\n      {\n        "id": "ep-1",\n        "episodeNumber": 1,\n        "title": "Episode 1",\n        "videoUrl": "https://...",\n        "duration": "24:00"\n      }\n    ]\n  }\n]'}
                rows={12}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!jsonInput.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-40 rounded-lg shadow cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Import Catalog JSON</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
