import { Anime } from './types';

// Sample collection of real anime titles that users can optionally load
export const SAMPLE_REAL_ANIME: Anime[] = [
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    japaneseTitle: '俺だけレベルアップな件',
    synopsis: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the weakest hunter of all mankind, is fatally injured in a high-rank double dungeon. He awakens with a mysterious player system that grants him the singular ability to level up infinitely.',
    bannerImage: '/images/hero_anime_cyberpunk_1793706206119.jpg',
    posterImage: '/images/poster_shonen_action_1793706206568.jpg',
    rating: 9.1,
    rank: 1,
    genres: ['Action', 'Fantasy', 'Shonen'],
    season: 'Winter 2024',
    year: 2024,
    studio: 'A-1 Pictures',
    episodesCount: 12,
    status: 'Airing',
    isFeatured: true,
    isTrending: true,
    episodes: [
      {
        id: 'sl-ep-1',
        animeId: 'solo-leveling',
        episodeNumber: 1,
        title: 'I’m Used to It',
        thumbnail: '/images/poster_shonen_action_1793706206568.jpg',
        duration: '14:20',
        durationSeconds: 860,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        introStart: 12,
        introEnd: 92,
        synopsis: 'E-Rank hunter Sung Jinwoo volunteers for a low-level raid that conceals an ominous double dungeon of smiling colossi.'
      },
      {
        id: 'sl-ep-2',
        animeId: 'solo-leveling',
        episodeNumber: 2,
        title: 'If I Had One More Chance',
        thumbnail: '/images/poster_shonen_action_1793706206568.jpg',
        duration: '13:45',
        durationSeconds: 825,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        introStart: 10,
        introEnd: 90,
        synopsis: 'Awakening in a hospital room, Jinwoo receives a daily quest floating interface that only he can see.'
      }
    ]
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan: The Final Season',
    japaneseTitle: '進撃の巨人 The Final Season',
    synopsis: 'Centuries ago, mankind was slaughtered by monstrous humanoid titans. Decades later inside the three concentric walls, Eren Yeager seeks the truth beyond the sea as ancient titan wars reach an earth-shattering climax.',
    bannerImage: '/images/poster_dark_fantasy_1793706207084.jpg',
    posterImage: '/images/poster_dark_fantasy_1793706207084.jpg',
    rating: 9.3,
    rank: 2,
    genres: ['Action', 'Fantasy', 'Drama'],
    season: 'Fall 2023',
    year: 2023,
    studio: 'MAPPA',
    episodesCount: 28,
    status: 'Finished',
    isFeatured: false,
    isTrending: true,
    episodes: [
      {
        id: 'aot-ep-1',
        animeId: 'attack-on-titan',
        episodeNumber: 1,
        title: 'The Other Side of the Sea',
        thumbnail: '/images/poster_dark_fantasy_1793706207084.jpg',
        duration: '12:50',
        durationSeconds: 770,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        introStart: 15,
        introEnd: 95,
        synopsis: 'On the battlefields of the Mid-East War, Eldian warrior candidates fight under the banner of Marley.'
      }
    ]
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen: Shibuya Incident',
    japaneseTitle: '呪術廻戦：渋谷事変',
    synopsis: 'In a world where negative human emotions take physical form as malevolent curses, high schooler Yuji Itadori swallows the cursed finger of the King of Curses, Ryomen Sukuna, entering Tokyo Jujutsu High.',
    bannerImage: '/images/hero_anime_cyberpunk_1793706206119.jpg',
    posterImage: '/images/poster_shonen_action_1793706206568.jpg',
    rating: 9.0,
    rank: 3,
    genres: ['Action', 'Supernatural', 'Shonen'],
    season: 'Fall 2023',
    year: 2023,
    studio: 'MAPPA',
    episodesCount: 23,
    status: 'Finished',
    isTrending: true,
    episodes: [
      {
        id: 'jjk-ep-1',
        animeId: 'jujutsu-kaisen',
        episodeNumber: 1,
        title: 'Shibuya Incident: Gate Open',
        thumbnail: '/images/poster_shonen_action_1793706206568.jpg',
        duration: '14:10',
        durationSeconds: 850,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        introStart: 10,
        introEnd: 90,
        synopsis: 'On Halloween night in Shibuya, a veil descends trapping thousands of civilians.'
      }
    ]
  },
  {
    id: 'frieren-journey',
    title: 'Frieren: Beyond Journey’s End',
    japaneseTitle: '葬送のフリーレン',
    synopsis: 'The hero party defeated the Demon King, bringing peace to the land. As an elf with a lifespan of thousands of years, mage Frieren watches her human companions age and pass away, inspiring her to embark on a quest to truly understand mortals.',
    bannerImage: '/images/poster_dark_fantasy_1793706207084.jpg',
    posterImage: '/images/poster_dark_fantasy_1793706207084.jpg',
    rating: 9.4,
    rank: 4,
    genres: ['Fantasy', 'Drama', 'Adventure'],
    season: 'Winter 2024',
    year: 2024,
    studio: 'Madhouse',
    episodesCount: 28,
    status: 'Finished',
    isTrending: true,
    episodes: [
      {
        id: 'fri-ep-1',
        animeId: 'frieren-journey',
        episodeNumber: 1,
        title: 'The Journey’s End',
        thumbnail: '/images/poster_dark_fantasy_1793706207084.jpg',
        duration: '15:00',
        durationSeconds: 900,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        introStart: 12,
        introEnd: 92,
        synopsis: 'Frieren returns to the capital fifty years after the victory festival, finding her old friends frail with age.'
      }
    ]
  },
  {
    id: 'cyberpunk-edgerunners',
    title: 'Cyberpunk: Edgerunners',
    japaneseTitle: 'サイバーパンク エッジランナーズ',
    synopsis: 'In a dystopian city riddled with corruption and cybernetic implants, a reckless street kid named David Martinez survives a drive-by tragedy and chooses to become an edgerunner mercenary.',
    bannerImage: '/images/hero_anime_cyberpunk_1793706206119.jpg',
    posterImage: '/images/hero_anime_cyberpunk_1793706206119.jpg',
    rating: 8.9,
    rank: 5,
    genres: ['Action', 'Sci-Fi', 'Cyberpunk'],
    season: 'Fall 2022',
    year: 2022,
    studio: 'Trigger & CD Projekt Red',
    episodesCount: 10,
    status: 'Finished',
    isTrending: true,
    episodes: [
      {
        id: 'cpe-ep-1',
        animeId: 'cyberpunk-edgerunners',
        episodeNumber: 1,
        title: 'Let You Down',
        thumbnail: '/images/hero_anime_cyberpunk_1793706206119.jpg',
        duration: '11:30',
        durationSeconds: 690,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        introStart: 15,
        introEnd: 95,
        synopsis: 'Living in poverty with his EMT mother Gloria, academy outcast David obtains a military Sandevistan spinal cyberware.'
      }
    ]
  },
  {
    id: 'demon-slayer-infinity',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃：柱稽古編',
    synopsis: 'Tanjiro Kamado, a kindhearted youth whose family was slaughtered by demons, strives to become a Demon Slayer to avenge his family and find a cure to turn his demonized sister Nezuko back into a human.',
    bannerImage: '/images/poster_shonen_action_1793706206568.jpg',
    posterImage: '/images/poster_shonen_action_1793706206568.jpg',
    rating: 9.0,
    rank: 6,
    genres: ['Action', 'Shonen', 'Fantasy'],
    season: 'Spring 2024',
    year: 2024,
    studio: 'ufotable',
    episodesCount: 26,
    status: 'Airing',
    isTrending: true,
    episodes: [
      {
        id: 'ds-ep-1',
        animeId: 'demon-slayer-infinity',
        episodeNumber: 1,
        title: 'To Defeat Muzan Kibutsuji',
        thumbnail: '/images/poster_shonen_action_1793706206568.jpg',
        duration: '13:00',
        durationSeconds: 780,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        introStart: 10,
        introEnd: 90,
        synopsis: 'The Hashira gather at the Ubuyashiki estate as the Corps prepares for the ultimate siege.'
      }
    ]
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    synopsis: 'Denji is a young man living in extreme debt who works as a Devil Hunter alongside his devil pet Pochita. Betrayed and killed by yakuza, Pochita fuses with Denji’s heart, resurrecting him as the unstoppable Chainsaw Man.',
    bannerImage: '/images/hero_anime_cyberpunk_1793706206119.jpg',
    posterImage: '/images/poster_scifi_mecha_1793706207733.jpg',
    rating: 8.8,
    rank: 7,
    genres: ['Action', 'Supernatural', 'Horror'],
    season: 'Fall 2022',
    year: 2022,
    studio: 'MAPPA',
    episodesCount: 12,
    status: 'Finished',
    episodes: [
      {
        id: 'csm-ep-1',
        animeId: 'chainsaw-man',
        episodeNumber: 1,
        title: 'Dog & Chainsaw',
        thumbnail: '/images/poster_scifi_mecha_1793706207733.jpg',
        duration: '12:40',
        durationSeconds: 760,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        introStart: 14,
        introEnd: 94,
        synopsis: 'After being murdered by the Zombie Devil, Denji makes a blood pact with Pochita and revives with rip-cords in his chest.'
      }
    ]
  }
];
