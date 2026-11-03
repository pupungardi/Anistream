import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_REAL_ANIME } from '@/lib/sample-catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.toLowerCase().trim();

  if (!slug) {
    // Return all available indexed anime summaries
    const summaries = SAMPLE_REAL_ANIME.map((a) => ({
      slug: a.id,
      title: a.title,
      japaneseTitle: a.japaneseTitle,
      year: a.year,
      season: a.season,
      genres: a.genres,
      cover: a.posterImage,
      banner: a.bannerImage,
      rating: a.rating,
      studio: a.studio,
      episodesCount: a.episodesCount,
    }));
    return NextResponse.json({ success: true, count: summaries.length, data: summaries });
  }

  // Look up anime by slug
  const matched = SAMPLE_REAL_ANIME.find(
    (a) => a.id.toLowerCase() === slug || a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );

  if (!matched) {
    return NextResponse.json(
      {
        success: false,
        error: `Anime with slug "${slug}" not found in library.`,
        availableSlugs: SAMPLE_REAL_ANIME.map((a) => a.id),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      slug: matched.id,
      title: matched.title,
      japaneseTitle: matched.japaneseTitle,
      synopsis: matched.synopsis,
      dates: {
        season: matched.season,
        year: matched.year,
      },
      genres: matched.genres,
      cover: matched.posterImage,
      banner: matched.bannerImage,
      studio: matched.studio,
      rating: matched.rating,
      status: matched.status,
      episodesCount: matched.episodesCount,
      episodes: matched.episodes.map((ep) => ({
        id: ep.id,
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        duration: ep.duration,
        videoUrl: ep.videoUrl,
        thumbnail: ep.thumbnail,
        introStart: ep.introStart,
        introEnd: ep.introEnd,
      })),
    },
  });
}
