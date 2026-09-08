import { Song } from '../types';
import { ArtistDetailData } from '../components/ArtistDetailView';

export function getArtistProfileData(artistName: string, allSongs: Song[]): ArtistDetailData {
  const normName = (artistName || '').toLowerCase().trim();

  if (normName.includes('nusrat')) {
    return {
      name: 'Nusrat Fateh Ali Khan',
      genre: 'Pakistani Qawwali Artist',
      origin: 'Faisalabad, Pakistan',
      era: '1965 – 1997',
      description: 'Shahenshah-e-Qawwali (The King of Kings of Qawwali). World-renowned maestro celebrated for high-energy spiritual performances, hypnotic rhythms, and profound vocal range.',
      avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
      popularTracks: [
        {
          id: 'nusrat-track-1',
          title: 'Tumhe Dillagi',
          artist: 'Nusrat Fateh Ali Khan',
          album: 'Qawwali Classics',
          duration: '5:32',
          durationSec: 332,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
          genre: 'Qawwali / Sufi'
        },
        {
          id: 'nusrat-track-2',
          title: 'Afreen Afreen',
          artist: 'Nusrat Fateh Ali Khan',
          album: 'Sangam',
          duration: '6:45',
          durationSec: 405,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
          genre: 'Ghazal / Qawwali'
        },
        {
          id: 'nusrat-track-3',
          title: 'Allah Hoo',
          artist: 'Nusrat Fateh Ali Khan',
          album: 'Traditional Sufi Chants',
          duration: '7:15',
          durationSec: 435,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
          genre: 'Sufi Chants'
        },
        {
          id: 'nusrat-track-4',
          title: 'Mustt Mustt',
          artist: 'Nusrat Fateh Ali Khan',
          album: 'Mustt Mustt',
          duration: '5:12',
          durationSec: 312,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
          genre: 'World Fusion'
        },
        {
          id: 'nusrat-track-5',
          title: 'Yeh Jo Halka Halka Suroor',
          artist: 'Nusrat Fateh Ali Khan',
          album: 'En Concert A Paris',
          duration: '8:20',
          durationSec: 500,
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
          genre: 'Qawwali'
        }
      ],
      albums: [
        {
          id: 'album-mustt-mustt',
          title: 'Mustt Mustt',
          year: '1990',
          coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
          tracksCount: 8,
          genre: 'World Fusion',
          tracks: [
            {
              id: 'n-mm-1',
              title: 'Mustt Mustt (Title Track)',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Mustt Mustt',
              duration: '5:12',
              durationSec: 312,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
              genre: 'World Fusion'
            },
            {
              id: 'n-mm-2',
              title: 'Nothing Without You',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Mustt Mustt',
              duration: '5:04',
              durationSec: 304,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
              genre: 'World Fusion'
            },
            {
              id: 'n-mm-3',
              title: 'Tracery',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Mustt Mustt',
              duration: '4:48',
              durationSec: 288,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
              genre: 'World Fusion'
            }
          ]
        },
        {
          id: 'album-night-song',
          title: 'Night Song',
          year: '1996',
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
          tracksCount: 8,
          genre: 'Contemporary Sufi',
          tracks: [
            {
              id: 'n-ns-1',
              title: 'My Heart, My Life',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Night Song',
              duration: '5:29',
              durationSec: 329,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
              genre: 'Contemporary Sufi'
            },
            {
              id: 'n-ns-2',
              title: 'Intoxicated',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Night Song',
              duration: '7:34',
              durationSec: 454,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
              genre: 'Contemporary Sufi'
            }
          ]
        },
        {
          id: 'album-sangam',
          title: 'Sangam',
          year: '1996',
          coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
          tracksCount: 6,
          genre: 'Ghazals & Classics',
          tracks: [
            {
              id: 'n-sg-1',
              title: 'Afreen Afreen',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Sangam',
              duration: '6:45',
              durationSec: 405,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
              genre: 'Ghazal'
            },
            {
              id: 'n-sg-2',
              title: 'Gham Hai Ya Khushi',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'Sangam',
              duration: '5:50',
              durationSec: 350,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
              genre: 'Ghazal'
            }
          ]
        },
        {
          id: 'album-qawwali-paris',
          title: 'En Concert A Paris',
          year: '1988',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
          tracksCount: 5,
          genre: 'Live Traditional Qawwali',
          tracks: [
            {
              id: 'n-cp-1',
              title: 'Tumhe Dillagi (Live)',
              artist: 'Nusrat Fateh Ali Khan',
              album: 'En Concert A Paris',
              duration: '8:40',
              durationSec: 520,
              url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
              genre: 'Qawwali'
            }
          ]
        }
      ]
    };
  }

  // Dynamic fallback for any other artist (Atif Aslam, Arijit Singh, Rahat, etc.)
  const artistMatches = allSongs.filter(s => s.artist.toLowerCase().includes(normName));
  const fallbackSongs = artistMatches.length > 0 ? artistMatches : allSongs.slice(0, 5);

  return {
    name: artistName || 'Featured Artist',
    genre: fallbackSongs[0]?.genre ? `${fallbackSongs[0].genre} Icon` : 'Global Master Artist',
    origin: 'South Asia / Global',
    era: '1995 – Present',
    description: `Renowned recording artist with globally celebrated discography and master vocal performances.`,
    avatarUrl: fallbackSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    popularTracks: fallbackSongs,
    albums: [
      {
        id: `album-${encodeURIComponent(artistName)}-1`,
        title: `${artistName} Essentials`,
        year: '2023',
        coverUrl: fallbackSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
        tracksCount: fallbackSongs.length,
        genre: fallbackSongs[0]?.genre || 'Pop / Acoustic',
        tracks: fallbackSongs
      },
      {
        id: `album-${encodeURIComponent(artistName)}-2`,
        title: `Live Studio Masters`,
        year: '2021',
        coverUrl: fallbackSongs[1]?.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
        tracksCount: 6,
        genre: 'Acoustic / Live',
        tracks: fallbackSongs.slice(0, 3)
      }
    ]
  };
}
