'use client';

import { useEffect, useRef } from 'react';

export interface UseMediaKeyboardShortcutsOptions {
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeekForward: (seconds: number) => void;
  onSeekBackward: (seconds: number) => void;
  onToggleFullscreen?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  seekStepSeconds?: number;
  isEnabled?: boolean;
}

/**
 * Custom hook to handle global keyboard shortcuts for the media player.
 * Supports Space (play/pause), M (mute), ArrowRight (seek forward), ArrowLeft (seek backward),
 * ArrowUp/Down (volume), and F (fullscreen).
 *
 * Automatically bypasses shortcuts when focus is inside text fields, textareas, or contenteditables.
 */
export function useMediaKeyboardShortcuts({
  onTogglePlay,
  onToggleMute,
  onSeekForward,
  onSeekBackward,
  onToggleFullscreen,
  onVolumeUp,
  onVolumeDown,
  seekStepSeconds = 5,
  isEnabled = true,
}: UseMediaKeyboardShortcutsOptions) {
  // Store handlers in refs to avoid re-binding window event listeners on every render
  const handlersRef = useRef({
    onTogglePlay,
    onToggleMute,
    onSeekForward,
    onSeekBackward,
    onToggleFullscreen,
    onVolumeUp,
    onVolumeDown,
    seekStepSeconds,
  });

  // Keep ref synchronized outside of render
  useEffect(() => {
    handlersRef.current = {
      onTogglePlay,
      onToggleMute,
      onSeekForward,
      onSeekBackward,
      onToggleFullscreen,
      onVolumeUp,
      onVolumeDown,
      seekStepSeconds,
    };
  }, [
    onTogglePlay,
    onToggleMute,
    onSeekForward,
    onSeekBackward,
    onToggleFullscreen,
    onVolumeUp,
    onVolumeDown,
    seekStepSeconds,
  ]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept shortcut when typing in inputs, textareas, selects, or editable fields
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Handle shortcuts
      switch (event.code) {
        case 'Space':
        case 'KeyK': {
          event.preventDefault();
          handlersRef.current.onTogglePlay();
          break;
        }

        case 'KeyM': {
          event.preventDefault();
          handlersRef.current.onToggleMute();
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          handlersRef.current.onSeekForward(handlersRef.current.seekStepSeconds);
          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          handlersRef.current.onSeekBackward(handlersRef.current.seekStepSeconds);
          break;
        }

        case 'ArrowUp': {
          if (handlersRef.current.onVolumeUp) {
            event.preventDefault();
            handlersRef.current.onVolumeUp();
          }
          break;
        }

        case 'ArrowDown': {
          if (handlersRef.current.onVolumeDown) {
            event.preventDefault();
            handlersRef.current.onVolumeDown();
          }
          break;
        }

        case 'KeyF': {
          if (handlersRef.current.onToggleFullscreen) {
            event.preventDefault();
            handlersRef.current.onToggleFullscreen();
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled]);
}
