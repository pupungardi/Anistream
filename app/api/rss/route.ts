import { NextResponse } from 'next/server';
import { HENTAI_BASE, normalizeSlug } from '@/lib/hentai-api';
import { Anime, Episode } from '@/lib/types';

export const revalidate = 1800; // Cache 30 minutes

export async function GET() {
  try {
    const rssRes = await fetch(`${HENTAI_BASE}/rss.xml`, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 1800 },
      headers: {
        'Accept': 'application/xml, text/xml, application/rss+xml, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://hentaiocean.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!rssRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal mengambil RSS feed dari server Hentai Ocean (${rssRes.status}).`,
          data: [],
        },
        { status: 502 }
      );
    }

    const xmlText = await rssRes.text();
    const items: Anime[] = [];

    // Match each <item> ... </item> block
    const itemRegex = /<item[\s\S]*?<\/item>/gi;
    const itemMatches = xmlText.match(itemRegex) || [];

    for (let i = 0; i < itemMatches.length; i++) {
      const block = itemMatches[i];

      // Extract title
      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const rawTitle = titleMatch ? titleMatch[1].trim() : '';

      // Extract link or guid
      const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
      const guidMatch = block.match(/<guid[\s\S]*?>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/i);
      const rawLink = linkMatch ? linkMatch[1].trim() : guidMatch ? guidMatch[1].trim() : '';

      // Extract description
      const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
      const rawDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // Extract pubDate
      const pubDateMatch = block.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
      const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : '';

      // Extract media thumbnail / enclosure URL if present
      const mediaMatch = block.match(/(?:media:thumbnail|enclosure)[\s\S]*?url=["']([^"']+)["']/i);
      const extractedImage = mediaMatch ? mediaMatch[1] : '';

      const slug = normalizeSlug(rawLink || rawTitle);
      if (!slug) continue;

      const title =
        rawTitle ||
        slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      let year = 2024;
      if (pubDateStr) {
        const parsedYear = new Date(pubDateStr).getFullYear();
        if (!isNaN(parsedYear) && parsedYear > 1900) {
          year = parsedYear;
        }
      }

      const animeId = `hentai-${slug}`;
      const posterImage = extractedImage || `${HENTAI_BASE}/assets/cover/${slug}.jpg`;
      const bannerImage = `${HENTAI_BASE}/thumbnail/${slug}.webp`;

      const episodes: Episode[] = [
        {
          id: `${animeId}-ep-1`,
          animeId,
          episodeNumber: 1,
          title,
          thumbnail: bannerImage,
          duration: '25:00',
          durationSeconds: 1500,
          videoUrl: '',
          embedUrl: `${HENTAI_BASE}/embed/${slug}`,
          introStart: 0,
          introEnd: 0,
          synopsis: rawDesc || 'Tersedia di Hentai Ocean.',
        },
      ];

      items.push({
        id: animeId,
        title,
        japaneseTitle: title,
        synopsis: rawDesc || 'Tersedia di Hentai Ocean.',
        posterImage,
        bannerImage,
        rating: 0,
        rank: i + 1,
        genres: ['Hentai', 'Uncensored'],
        season: String(year),
        year,
        studio: 'Hentai Ocean',
        episodesCount: episodes.length,
        status: 'Finished',
        isFeatured: i === 0,
        isTrending: i < 5,
        episodes,
      });
    }

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        data: items,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Gagal mengambil katalog RSS Hentai Ocean: ${errorMsg}`,
        data: [],
      },
      { status: 502 }
    );
  }
}
