# AniStream - Modern Dark Anime Streaming Platform

A high-performance, dark-aesthetic streaming web application delivering curated anime series, multi-episode playback, live instant search, synchronized episode queues, skip intro/outro controls, playback speed toggles, community episode discussions, and personal watchlist tracking.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and anchor the architectural design:

- **Confirmed Catalog & Playback**: Curated anime library with verified playable video streams across top genres (Action, Shonen, Cyberpunk, Fantasy, Slice of Life) with instant live search and filtering.
- **Confirmed Player & Interactive Suite**: Advanced HTML5 cinema player featuring multi-episode queues, jump skip (+85s skip intro / -10s rewind), variable playback speeds (0.5x–2.0x), ambient theater mode, and interactive timestamped episode comments.
- **Confirmed Aesthetic & Atmosphere**: Premium dark streaming UI (deep obsidian `#0b0c10` and rich graphite surfaces) energized by sharp electric orange accents (`#f97316` / `#ea580c`), zero-pill metadata typography, and fluid transitions.

---

### 1. Overview & Core Concept

- **What It Does**: AniStream provides an immersive anime streaming hub where fans can browse trending and seasonal anime, filter by genre and rating, launch episodes in an advanced custom player, save shows to their personal watchlist, track episode watch history, and join timestamped discussions.
- **Target Audience / Persona**: Anime enthusiasts, binge-watchers, and community members who value fast streaming, smooth controls, and clean modern aesthetics over cluttered ad-heavy anime sites.
- **Key Value**: A smooth streaming interface free of distractions, featuring real video streaming capability, skip-intro convenience, episode progress persistence, and interactive community notes.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Browse & Discover*: Users land on a cinematic hero banner featuring a spotlight anime with immediate "Watch Ep 1" and "Add to Watchlist" triggers. Below, curated rows (Trending Now, Top Rated, Action & Adventure, Sci-Fi & Cyberpunk, New Releases) showcase titles with hover previews.
  2. *Instant Search & Filter*: A responsive search bar in the header filters instantly by title, genre, and status without full-page reloads, with quick tag filtering directly below.
  3. *Anime Detail & Episode Selector*: Clicking any title opens a dedicated show view with synopsis, studio, release year, episode thumbnails, and episode duration.
  4. *Cinema Streaming Player*: When an episode is launched, the view shifts seamlessly to the cinema player with:
     - Custom playback controls (Play/Pause, scrub bar with hover time preview, Volume slider, Mute).
     - Quality and speed selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x).
     - Dedicated "Skip Intro (+85s)" and "Next Episode" overlays.
     - Ambient backdrop lighting matching the current video tone.
     - Next episode auto-play with countdown toast.
  5. *Community Episode Discussions*: Beneath the player, users can post timestamped comments and read community reactions for that exact episode.
  6. *Personal Watchlist & History*: Users can bookmark shows into "Watching", "Plan to Watch", and "Completed", with episode progress saved locally.

- **Visual Identity & Theme**:
  - *Canvas & Surfaces*: 60% deep obsidian background (`#07080a`), 30% structural dark slate cards (`#12141a` with subtle `#1e222d` hairline borders).
  - *Accent Budget (10%)*: Radiant flame orange (`#f97316` and `#fb923c`) strictly applied to active playback progress, primary watch buttons, active tab indicators, and focus rings.
  - *Typography*: Geometric display typography for headers (`Plus Jakarta Sans` / modern bold sans) with clean tabular numerals (`tabular-nums`) for episode counts, timestamps, and durations.
  - *Anti-Slop Discipline*: Zero static pill tags (metadata displayed as clean inline text separated by `·`), no mechanical comment tags or fake system logs, no decorative pulsing dots, and no crowded header buttons.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Curated Library with Verified Open Stream Feeds**:
  - *Chosen Approach*: Ship a comprehensive, richly detailed library of 12+ iconic anime series (each with multiple playable MP4/HLS streams and realistic episode metadata), plus real-time search and filter.
  - *Why*: Ensures 100% reliable, zero-latency playback in all sandbox environments without CORS or rate-limit failures from third-party illegal scrapers.
  - *Alternatives Considered*: Direct external scraper APIs (often blocked, slow, or contain intrusive pop-up ads).
- **Decision 2: Client-authoritative Persistence with Local Storage**:
  - *Chosen Approach*: Store user watchlists, watch progress, playback resume timestamps, and custom episode comments in `localStorage`.
  - *Why*: Instant state changes with zero latency, offline resilience, and immediate bookmarking without requiring user login friction.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AniStream Application                         │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar (Contract: Brand Wordmark — 4 Nav Links — Watchlist Button)   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Hero Spotlight      │  │        Cinema Video Player            │  │
│  │   (Marquee Anime +    │  │  - Custom HTML5 Video Scrub Controls  │  │
│  │    Quick Play & Save) │  │  - Skip Intro (+85s) / Next Episode   │  │
│  └───────────────────────┘  │  - Speed Select & Quality Toggles     │  │
│                             │  - Episode Queue & Timestamp Comments │  │
│                             └───────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Browse & Discovery Grids                                         │  │
│  │ (Live Search, Genre Filters, Trending Rows, Episode Drawers)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Local State Engine (Storage Hook)                                │  │
│  │ - Watchlist (Watching, Plan, Done)                               │  │
│  │ - Playback Progress & History                                    │  │
│  │ - Episode Comments & Likes                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component Mapping**:
  - `Navbar`: Search modal trigger, Category navigation, Watchlist counter badge.
  - `HeroSpotlight`: Large 16:9 featured series with quick launch and details modal.
  - `VideoPlayer`: Advanced custom video player with full-screen, picture-in-picture, skip intro, speed presets, and next-episode transitions.
  - `EpisodeDrawer`: Side-by-side or below-player episode carousel with episode thumbnails, titles, runtimes, and watched status.
  - `CommentSection`: Episode-specific discussions with timestamp tags, user upvotes, and posting form.
  - `WatchlistModal`: Dedicated sliding drawer or modal displaying user's saved anime categorized by status with one-click resume.

- **Data Model**:
  - `Anime`: id, title, japaneseTitle, synopsis, bannerImage, posterImage, rating, genres, season, year, studio, episodes: Array<Episode>.
  - `Episode`: id, episodeNumber, title, thumbnail, duration, videoUrl, introStart, introEnd.
  - `WatchProgress`: animeId, episodeId, progressSeconds, totalSeconds, completed, lastWatchedAt.
  - `Comment`: id, animeId, episodeId, user, avatar, text, timestamp, createdAt, likes.
