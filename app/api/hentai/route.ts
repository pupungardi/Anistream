import { NextRequest, NextResponse } from 'next/server';
import { HENTAI_BASE, isValidSlug, mapHentaiResponse } from '@/lib/hentai-api';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get('slug');

  if (!rawSlug || !isValidSlug(rawSlug)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or missing slug parameter. Must match format /^[a-z0-9][a-z0-9-_]{0,120}$/i.',
      },
      { status: 400 }
    );
  }

  const slug = rawSlug.trim().toLowerCase();
  const upstreamUrl = `${HENTAI_BASE}/api?action=hentai&slug=${encodeURIComponent(slug)}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AniStream/1.0',
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Upstream service responded with status ${upstreamRes.status} (${upstreamRes.statusText})`,
        },
        { status: upstreamRes.status >= 500 ? 502 : upstreamRes.status }
      );
    }

    const rawData = await upstreamRes.json();

    // Verify info array exists and has at least one item
    if (!rawData || !Array.isArray(rawData.info) || rawData.info.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No hentai found for slug: "${slug}"`,
        },
        { status: 404 }
      );
    }

    const anime = mapHentaiResponse(rawData, slug);

    return NextResponse.json(
      {
        success: true,
        data: anime,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    const isTimeout = err?.name === 'TimeoutError' || err?.name === 'AbortError';

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Upstream request timed out after 10 seconds'
          : `Failed to fetch from upstream: ${err?.message || 'Network error'}`,
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
