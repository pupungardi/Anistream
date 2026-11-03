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

  const externalUrl = `https://hentaiocean.com/api?action=hentai&slug=${encodeURIComponent(slug)}`;

  try {
    const externalResponse = await fetch(externalUrl, { headers: { Accept: 'application/json' } });
    const externalPayload = await externalResponse.json();

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, source: externalUrl, data: externalPayload.data ?? externalPayload });
    }

    return NextResponse.json(
      { success: false, error: externalPayload?.message || `Anime with slug "${slug}" was not found.` },
      { status: externalResponse.status }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to reach the HentaiOcean API.' }, { status: 502 });
  }
}
