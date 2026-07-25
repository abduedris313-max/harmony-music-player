import { Track, Playlist, Album, Artist } from '../types/music';

// Public domain / royalty-free high quality audio streams
export const MOCK_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Aura Soundscapes',
    album: 'Neon Dreams',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: 147,
    genre: 'Lo-Fi / Chill',
    releaseYear: 2024,
    isExplicit: false,
    isLossless: true,
    colorHex: '#8b5cf6',
    lyrics: [
      { time: 0, text: '(Instrumental Intro)' },
      { time: 12, text: 'Neon lights reflecting on the rainy street' },
      { time: 24, text: 'Walking slow to the rhythmic pulse and beat' },
      { time: 38, text: 'Subtle bass lines echoing through the night' },
      { time: 52, text: 'Everything is clear in this purple light' },
      { time: 68, text: 'Glow of city towers fading in the haze' },
      { time: 85, text: 'Lost in the harmony of endless days' },
      { time: 105, text: 'Smooth synth waves washing over me' },
      { time: 125, text: 'Pure tranquility setting us free' },
      { time: 140, text: '(Outro Fading Out)' }
    ]
  },
  {
    id: 'track-2',
    title: 'Acoustic Horizon',
    artist: 'Ember Wood',
    album: 'Golden Hour Session',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitars-ambient-10852.mp3',
    duration: 132,
    genre: 'Acoustic / Folk',
    releaseYear: 2023,
    isExplicit: false,
    isLossless: true,
    colorHex: '#f59e0b',
    lyrics: [
      { time: 0, text: '(Gentle Guitar Strumming)' },
      { time: 15, text: 'Morning sun breaks through the pine' },
      { time: 30, text: 'Warm breeze whispering through the line' },
      { time: 48, text: 'Miles away from the noisy crowd' },
      { time: 65, text: 'Simple thoughts spoken out loud' },
      { time: 82, text: 'Strings resonate soft and deep' },
      { time: 102, text: 'Promises we swore to keep' },
      { time: 120, text: '(Fading Acoustic Solo)' }
    ]
  },
  {
    id: 'track-3',
    title: 'Cybernetic Horizon',
    artist: 'Vapor Wave Project',
    album: 'Retrofuturism Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=synthwave-80s-110045.mp3',
    duration: 185,
    genre: 'Synthwave / Electronic',
    releaseYear: 2024,
    isExplicit: true,
    isLossless: true,
    colorHex: '#ec4899',
    lyrics: [
      { time: 0, text: '(Synthesizer Arpeggio)' },
      { time: 18, text: 'Drive into the 1985 sunset grid' },
      { time: 35, text: 'Remembering all the wild things we did' },
      { time: 55, text: 'Analog warmth in a digital dream' },
      { time: 78, text: 'Riding down the electric stream' },
      { time: 100, text: 'Heavy drums pounding in synch' },
      { time: 125, text: 'Closer to the edge than you think' },
      { time: 150, text: 'Retro future forever alive' },
      { time: 170, text: '(Outro Synth Solo)' }
    ]
  },
  {
    id: 'track-4',
    title: 'Clair de Lune (Modern Ambient Chill)',
    artist: 'Claude Debussy (Reimagined)',
    album: 'Classical Transcended',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_40ad4a1b02.mp3?filename=relaxing-piano-music-23098.mp3',
    duration: 160,
    genre: 'Classical / Ambient',
    releaseYear: 2022,
    isExplicit: false,
    isLossless: true,
    colorHex: '#0284c7',
    lyrics: [
      { time: 0, text: '(Classical Piano Intro)' },
      { time: 20, text: 'Gentle keys like moonlight falling' },
      { time: 50, text: 'Silent ocean tides recalling' },
      { time: 85, text: 'Echoes of a timeless melody' },
      { time: 120, text: 'Peaceful waves across the sea' },
      { time: 145, text: '(Piano Resolves Softly)' }
    ]
  },
  {
    id: 'track-5',
    title: 'Deep Focus Groove',
    artist: 'Mindful Beats',
    album: 'Flow State Sessions',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f37372.mp3?filename=chill-abstract-intention-12099.mp3',
    duration: 154,
    genre: 'Lo-Fi / Downtempo',
    releaseYear: 2024,
    isExplicit: false,
    isLossless: false,
    colorHex: '#10b981',
    lyrics: [
      { time: 0, text: '(Subtle Percussion)' },
      { time: 20, text: 'Clear the noise and free your mind' },
      { time: 45, text: 'Focus on the rhythm you find' },
      { time: 75, text: 'Steady pace and peaceful state' },
      { time: 110, text: 'Unlock what you can create' },
      { time: 140, text: '(Smooth fade out)' }
    ]
  },
  {
    id: 'track-6',
    title: 'Starlight Symphony',
    artist: 'Celestial Orchestra',
    album: 'Galactic Overtures',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&auto=format&fit=crop',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c2a4f48b99.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
    duration: 198,
    genre: 'Cinematic / Orchestral',
    releaseYear: 2023,
    isExplicit: false,
    isLossless: true,
    colorHex: '#6366f1',
    lyrics: [
      { time: 0, text: '(Orchestral Strings Rising)' },
      { time: 30, text: 'Violins soar across the galaxy' },
      { time: 65, text: 'Brass section enters with grand majesty' },
      { time: 105, text: 'Crescendo reaching peak emotional height' },
      { time: 150, text: 'Shining like stars in the midnight sky' },
      { time: 180, text: '(Final Resolving Chord)' }
    ]
  }
];

export const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-today-hits',
    name: "Today's Chill Hits",
    description: 'The smoothest ambient, lo-fi, and chill acoustic tracks updated daily.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    tracks: [MOCK_TRACKS[0], MOCK_TRACKS[1], MOCK_TRACKS[4]]
  },
  {
    id: 'pl-synthwave',
    name: '80s Retro Drive',
    description: 'Analog synthwave, neon pulses, and highway cruising anthems.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    tracks: [MOCK_TRACKS[2], MOCK_TRACKS[0]]
  },
  {
    id: 'pl-deep-focus',
    name: 'Deep Focus & Coding',
    description: 'Instrumental flow state music engineered for intense concentration.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    tracks: [MOCK_TRACKS[4], MOCK_TRACKS[3], MOCK_TRACKS[5]]
  }
];

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'alb-neon-dreams',
    title: 'Neon Dreams',
    artist: 'Aura Soundscapes',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    releaseYear: 2024,
    genre: 'Lo-Fi / Chill',
    tracks: [MOCK_TRACKS[0]]
  },
  {
    id: 'alb-golden-hour',
    title: 'Golden Hour Session',
    artist: 'Ember Wood',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    releaseYear: 2023,
    genre: 'Acoustic / Folk',
    tracks: [MOCK_TRACKS[1]]
  },
  {
    id: 'alb-retrofuturism',
    title: 'Retrofuturism Vol. 1',
    artist: 'Vapor Wave Project',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    releaseYear: 2024,
    genre: 'Synthwave / Electronic',
    tracks: [MOCK_TRACKS[2]]
  }
];

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'art-aura',
    name: 'Aura Soundscapes',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    bio: 'Pioneer of atmospheric lo-fi beats blending analog synthesizers with natural ambient field recordings.',
    genres: ['Lo-Fi', 'Chillout', 'Ambient']
  },
  {
    id: 'art-ember',
    name: 'Ember Wood',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    bio: 'Singer-songwriter and multi-instrumentalist capturing raw acoustic guitar soundscapes.',
    genres: ['Acoustic', 'Folk', 'Indie']
  },
  {
    id: 'art-vapor',
    name: 'Vapor Wave Project',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    bio: 'Electronic synthwave collective inspired by 1980s neon culture and retro sci-fi video games.',
    genres: ['Synthwave', 'Electronic', 'Retrowave']
  }
];
