'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  FastForward,
  SkipForward,
  SkipBack,
  Sliders,
  Tv,
  ExternalLink,
  Check,
  Keyboard
} from 'lucide-react';
import { Episode, Anime } from '../lib/types';
import { useMediaKeyboardShortcuts } from '../hooks/use-media-keyboard-shortcuts';

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onProgressUpdate: (episodeId: string, progressSeconds: number, durationSeconds: number) => void;
  isTheaterMode: boolean;
  onToggleTheaterMode: () => void;
  jumpToTimestamp?: number | null;
  onResetJumpTimestamp?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  episode,
  onNextEpisode,
  onPrevEpisode,
  hasNext,
  hasPrev,
  onProgressUpdate,
  isTheaterMode,
  onToggleTheaterMode,
  jumpToTimestamp,
  onResetJumpTimestamp,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [customStreamModal, setCustomStreamModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customStreamUrl, setCustomStreamUrl] = useState<string | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeVideoSrc = customStreamUrl || episode.videoUrl;

  // Jump to specific comment timestamp if requested
  useEffect(() => {
    if (jumpToTimestamp !== null && jumpToTimestamp !== undefined && videoRef.current) {
      videoRef.current.currentTime = jumpToTimestamp;
      videoRef.current.play().catch(() => {});
      if (onResetJumpTimestamp) {
        onResetJumpTimestamp();
      }
    }
  }, [jumpToTimestamp, onResetJumpTimestamp]);

  // Handle play / pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Format seconds to mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(dur);

    // Save progress periodically
    if (dur > 0 && Math.floor(current) % 3 === 0) {
      onProgressUpdate(episode.id, current, dur);
    }
  };

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Skip 10s forward / back
  const skipTime = useCallback((amount: number) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + amount));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  // Skip Intro (+85s jump or jump directly to introEnd)
  const handleSkipIntro = () => {
    if (!videoRef.current) return;
    const targetTime = episode.introEnd > 0 ? episode.introEnd : videoRef.current.currentTime + 85;
    videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, targetTime);
    setCurrentTime(videoRef.current.currentTime);
  };

  // Check if current time is within intro window
  const isInsideIntro = currentTime >= episode.introStart && currentTime <= episode.introEnd;

  // Change playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  // Volume & Mute
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted]);

  const adjustVolume = useCallback((delta: number) => {
    if (!videoRef.current) return;
    const currentVol = isMuted ? 0 : volume;
    const newVol = Math.max(0, Math.min(1, Math.round((currentVol + delta) * 100) / 100));
    setVolume(newVol);
    videoRef.current.volume = newVol;
    const nextMuted = newVol === 0;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isMuted, volume]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global keyboard shortcuts via custom hook
  useMediaKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onToggleMute: toggleMute,
    onSeekForward: (sec) => skipTime(sec),
    onSeekBackward: (sec) => skipTime(-sec),
    onToggleFullscreen: toggleFullscreen,
    onVolumeUp: () => adjustVolume(0.05),
    onVolumeDown: () => adjustVolume(-0.05),
    seekStepSeconds: 5,
    isEnabled: true,
  });

  // Video Ended -> Trigger auto next countdown
  const handleVideoEnded = () => {
    setIsPlaying(false);
    onProgressUpdate(episode.id, duration, duration);
    if (hasNext && onNextEpisode) {
      setAutoNextCountdown(5);
    }
  };

  // Handle countdown interval
  useEffect(() => {
    if (autoNextCountdown === null) return;
    if (autoNextCountdown === 0) {
      if (onNextEpisode) onNextEpisode();
      return;
    }
    const timer = setInterval(() => {
      setAutoNextCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [autoNextCountdown, onNextEpisode]);

  // Mouse activity timer for hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 2800);
  };

  const applyCustomStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setCustomStreamUrl(customUrlInput.trim());
      setCustomStreamModal(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full bg-black overflow-hidden group select-none ${
        isTheaterMode ? 'max-w-none' : 'max-w-7xl mx-auto rounded-xl border border-zinc-800/80 shadow-2xl'
      }`}
    >
      {/* HTML5 Video Element with Key on episode id */}
      <div className="relative aspect-video w-full flex items-center justify-center bg-black cursor-pointer" onClick={togglePlay}>
        <video
          key={episode.id + activeVideoSrc}
          ref={videoRef}
          src={activeVideoSrc}
          className="w-full h-full object-contain"
          playsInline
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              videoRef.current.playbackRate = playbackSpeed;
            }
            setIsBuffering(false);
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnded}
        />

        {/* Buffering Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Auto Next Episode Toast Overlay */}
        {autoNextCountdown !== null && hasNext && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-4 text-center p-6 z-30"
          >
            <div className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
              Up Next in {autoNextCountdown}s
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white max-w-lg">
              Episode {episode.episodeNumber + 1}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoNextCountdown(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setAutoNextCountdown(null);
                  if (onNextEpisode) onNextEpisode();
                }}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-lg cursor-pointer"
              >
                <FastForward className="w-4 h-4 fill-white" />
                Play Now
              </button>
            </div>
          </div>
        )}

        {/* Top Header Information Overlay in Player */}
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-20 flex items-center justify-between pointer-events-auto ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
              {anime.title} · Episode {episode.episodeNumber}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {episode.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded border border-zinc-700/60 cursor-pointer"
              title="Keyboard shortcuts guide"
            >
              <Keyboard className="w-3 h-3 text-orange-400" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>
            <button
              onClick={() => setCustomStreamModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 rounded border border-zinc-700/60 cursor-pointer"
              title="Stream custom URL"
            >
              <ExternalLink className="w-3 h-3 text-orange-400" />
              <span className="hidden sm:inline">Stream Source</span>
            </button>
          </div>
        </div>

        {/* Skip Intro Overlay Button */}
        {(isInsideIntro || currentTime < 100) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkipIntro();
            }}
            className={`absolute bottom-20 right-6 z-20 flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg border backdrop-blur-md shadow-2xl transition-all cursor-pointer ${
              isInsideIntro
                ? 'bg-orange-600 text-white border-orange-500 hover:bg-orange-500 scale-105 animate-pulse'
                : 'bg-black/75 text-zinc-200 border-zinc-700 hover:border-orange-500 hover:text-orange-400'
            }`}
          >
            <FastForward className="w-3.5 h-3.5 fill-current" />
            <span>Skip Intro (+85s)</span>
          </button>
        )}
      </div>

      {/* Bottom Video Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/85 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar (Scrubber) */}
        <div className="relative flex items-center group/scrub mb-3 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${progressPercent}%, #3f3f46 ${progressPercent}%, #3f3f46 100%)`,
            }}
          />
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-between text-zinc-300">
          {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Time */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-orange-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Prev / Next Episode Buttons */}
            {hasPrev && (
              <button
                onClick={onPrevEpisode}
                className="hover:text-white transition-colors cursor-pointer"
                title="Previous Episode"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNextEpisode}
                className="hover:text-white transition-colors cursor-pointer"
                title="Next Episode"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Quick 10s Rewind / Forward */}
            <button
              onClick={() => skipTime(-10)}
              className="hover:text-white transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="hover:text-white transition-colors cursor-pointer"
              title="Fast Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="hover:text-white cursor-pointer" title="Mute/Unmute (M)">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Formatted Time Stamp (Tabular Figures) */}
            <div className="text-xs font-mono tabular-nums text-zinc-400">
              <span className="text-zinc-200">{formatTime(currentTime)}</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Theater, Fullscreen */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Speed Selector Button & Popover */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded transition-colors cursor-pointer"
                title="Playback Speed"
              >
                <Sliders className="w-3 h-3 text-orange-400" />
                <span className="tabular-nums">{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-lg py-1 shadow-2xl z-30 min-w-[90px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer hover:bg-zinc-800 ${
                        playbackSpeed === speed ? 'text-orange-400 font-bold' : 'text-zinc-300'
                      }`}
                    >
                      <span>{speed}x</span>
                      {playbackSpeed === speed && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theater Mode Toggle */}
            <button
              onClick={onToggleTheaterMode}
              className={`hover:text-white transition-colors cursor-pointer hidden sm:block ${
                isTheaterMode ? 'text-orange-400' : 'text-zinc-300'
              }`}
              title={isTheaterMode ? 'Standard Mode' : 'Theater Mode'}
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Stream Source URL Switcher Modal */}
      {customStreamModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-orange-500" />
              Custom Video Stream Source
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste a custom direct MP4, WebM, or HLS stream URL to stream your own video in the AniStream player.
            </p>
            <form onSubmit={applyCustomStream} className="space-y-3">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/anime-episode.mp4"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomStreamModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow cursor-pointer"
                >
                  Load Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-40"
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-orange-500" />
                Player Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Global shortcuts active while player is open:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Play / Pause</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">Space</kbd>
                  <span className="text-zinc-500">or</span>
                  <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">K</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Mute / Unmute Audio</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Seek Backward (-5s)</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">← Arrow Left</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Seek Forward (+5s)</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">→ Arrow Right</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Volume Up / Down</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">↑</kbd>
                  <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">↓</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-zinc-950/70 rounded border border-zinc-800">
                <span className="text-zinc-300">Toggle Fullscreen</span>
                <kbd className="px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-200 font-mono">F</kbd>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
