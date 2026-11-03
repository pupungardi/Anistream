import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AniStream - Anime Streaming Platform',
  description: 'Stream curated anime series with high-performance player, episode queue, skip intro, timestamped comments, and personal watchlists.',
  openGraph: {
    title: 'AniStream - Anime Streaming Platform',
    description: 'Stream curated anime series with high-performance player, episode queue, skip intro, timestamped comments, and personal watchlists.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AniStream - Anime Streaming Platform',
    description: 'Stream curated anime series with high-performance player, episode queue, skip intro, timestamped comments, and personal watchlists.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07080a] text-zinc-100 antialiased selection:bg-orange-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
