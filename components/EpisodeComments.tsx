'use client';

import React, { useState } from 'react';
import { MessageSquare, Heart, Clock, Send } from 'lucide-react';
import { EpisodeComment } from '../lib/types';

interface EpisodeCommentsProps {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  comments: EpisodeComment[];
  onAddComment: (animeId: string, episodeId: string, text: string, timestampSeconds?: number) => void;
  onToggleLike: (commentId: string) => void;
  onJumpToTimestamp: (seconds: number) => void;
  currentVideoTime?: number;
}

export const EpisodeComments: React.FC<EpisodeCommentsProps> = ({
  animeId,
  episodeId,
  episodeNumber,
  comments,
  onAddComment,
  onToggleLike,
  onJumpToTimestamp,
  currentVideoTime = 0,
}) => {
  const [commentText, setCommentText] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const episodeComments = comments.filter((c) => c.episodeId === episodeId);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const timestamp = includeTimestamp ? Math.floor(currentVideoTime) : undefined;
    onAddComment(animeId, episodeId, commentText.trim(), timestamp);
    setCommentText('');
    setIncludeTimestamp(false);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Episode {episodeNumber} Discussion</span>
          <span className="text-xs text-zinc-500 font-normal tabular-nums">
            ({episodeComments.length} comments)
          </span>
        </h3>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-[#0e1017] rounded-xl border border-zinc-800/80 space-y-3">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`Share your thoughts on Episode ${episodeNumber}...`}
          rows={2}
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700/80 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none transition-colors"
        />

        <div className="flex items-center justify-between gap-2">
          {/* Include timestamp button */}
          <button
            type="button"
            onClick={() => setIncludeTimestamp(!includeTimestamp)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
              includeTimestamp
                ? 'bg-orange-600/20 border-orange-500 text-orange-400 font-semibold'
                : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tag Time ({formatSeconds(currentVideoTime)})</span>
          </button>

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 rounded-md shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3">
        {episodeComments.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 bg-[#0e1017] rounded-lg border border-zinc-800/60">
            Be the first to leave a comment on this episode!
          </div>
        ) : (
          episodeComments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 bg-[#0e1017] rounded-xl border border-zinc-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full bg-zinc-800 object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-200">
                      {comment.author}
                    </span>
                    <span className="text-[11px] text-zinc-500 ml-2">
                      {comment.createdAt}
                    </span>
                  </div>
                </div>

                {/* Timestamp Jump Badge if tagged */}
                {comment.timestampSeconds !== undefined && (
                  <button
                    onClick={() => onJumpToTimestamp(comment.timestampSeconds!)}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold text-orange-400 bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 rounded transition-colors cursor-pointer"
                    title={`Jump to ${formatSeconds(comment.timestampSeconds)}`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatSeconds(comment.timestampSeconds)}</span>
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-9">
                {comment.text}
              </p>

              <div className="flex items-center justify-end pl-9">
                <button
                  onClick={() => onToggleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                    comment.userLiked
                      ? 'text-orange-500 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-orange-500 text-orange-500' : ''}`} />
                  <span className="tabular-nums">{comment.likes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
