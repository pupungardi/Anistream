import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug')?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: 'A slug is required.' }, { status: 400 });
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
