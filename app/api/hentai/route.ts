import { NextRequest, NextResponse } from 'next/server';
import { HENTAI_BASE, normalizeSlug, isValidSlug, mapHentaiResponse } from '@/lib/hentai-api';

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get('slug');

  if (!rawSlug) {
    return NextResponse.json(
      {
        success: false,
        error: 'Slug tidak boleh kosong. Coba contoh: my-mother-1',
      },
      { status: 400 }
    );
  }

  const slug = normalizeSlug(rawSlug);

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Slug tidak valid, coba contoh: my-mother-1',
      },
      { status: 400 }
    );
  }

  const upstreamUrl = `${HENTAI_BASE}/api?action=hentai&slug=${encodeURIComponent(slug)}`;

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://hentaiocean.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal mengambil data dari server (${upstreamRes.status}). Silakan coba lagi.`,
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
          error: `Anime dengan slug "${slug}" tidak ditemukan. Coba contoh: my-mother-1`,
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
          ? 'Koneksi ke server Hentai Ocean mengalami timeout. Silakan coba lagi.'
          : 'Gagal terhubung ke server Hentai Ocean. Silakan periksa koneksi atau coba lagi nanti.',
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
