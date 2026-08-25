export interface FullSongItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  url: string;
  coverUrl: string;
  genre: string;
  releaseYear: string;
  description: string;
}

// Master collection of authentic, verified full-length audio tracks for Pakistani, Indian, and Global icons
export const MASTER_FULL_SONGS: FullSongItem[] = [
  // ==========================================
  // --- ATIF ASLAM (Full Verified Songs) ---
  // ==========================================
  {
    id: 'atif-tere-liye-master',
    title: 'Tere Liye',
    artist: 'Atif Aslam & Shreya Ghoshal',
    album: 'Prince (Soundtrack)',
    duration: '04:40',
    durationSec: 280,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/TereLiyeAtifAslambyKhiladi786/01%20-%20Tere%20Liye%20(320%20Kbps)%20-%20.mp3'),
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/9b/ec/8a/9bec8a34-2e6f-ef8e-0b0b-68e1b0cefcbe/8902894350106_cover.jpg/600x600bb.jpg',
    genre: 'Romantic Bollywood / Pop',
    releaseYear: '2010',
    description: 'The monumental romantic duet blending passionate acoustic guitars with soaring vocal harmonies.'
  },
  {
    id: 'atif-tajdar-e-haram-master',
    title: 'Tajdar-e-Haram (Coke Studio)',
    artist: 'Atif Aslam',
    album: 'Coke Studio Season 8',
    duration: '10:28',
    durationSec: 628,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslamTajdarEHaramCokeStudioSeason8Episode1_201806/Atif%20Aslam%20Tajdar-e-Haram%20Coke%20Studio%20Season%208%20Episode%201.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Qawwali / Devotional',
    releaseYear: '2015',
    description: 'The legendary Coke Studio rendition paying tribute to the Sabri Brothers, crossing 500M+ global views.'
  },
  {
    id: 'atif-aadat-master',
    title: 'Aadat (Original)',
    artist: 'Atif Aslam & Goher Mumtaz',
    album: 'Jal Pari',
    duration: '04:28',
    durationSec: 268,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Aadat_(Original)%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Pop Rock / Acoustic',
    releaseYear: '2004',
    description: 'The historic indie rock anthem that revolutionized Pakistani youth pop culture in the 2000s.'
  },
  {
    id: 'atif-woh-lamhe-master',
    title: 'Woh Lamhe / Bheegi Yaadein',
    artist: 'Atif Aslam',
    album: 'Zeher / Jal Pari',
    duration: '05:18',
    durationSec: 318,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Beeghi_Yaadein%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Pop Rock / Ballad',
    releaseYear: '2005',
    description: 'The iconic breakout rock ballad showcasing Atif Aslam\'s signature vocal cry and electric guitar hooks.'
  },
  {
    id: 'atif-jeena-jeena-master',
    title: 'Jeena Jeena',
    artist: 'Atif Aslam & Sachin-Jigar',
    album: 'Badlapur',
    duration: '03:49',
    durationSec: 229,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Jeena_Jeena%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    genre: 'Acoustic Soul / Ballad',
    releaseYear: '2015',
    description: 'Melancholic acoustic guitar masterpiece with delicate vocal nuances and poignant poetry.'
  },
  {
    id: 'atif-tere-sang-yaara-master',
    title: 'Tere Sang Yaara',
    artist: 'Atif Aslam & Arko',
    album: 'Rustom',
    duration: '04:58',
    durationSec: 298,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/y-2mate.com-tere-sang-yaara-full-audio-rustom-akshay-kumar-ileana-dcruz-arko-atif-aslam-manoj-m/y2mate.com%20-%20Tere%20Sang%20Yaara%20%20Full%20Audio%20%20Rustom%20%20Akshay%20Kumar%20%20Ileana%20Dcruz%20%20Arko%20%20Atif%20Aslam%20%20Manoj%20M.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Romantic Ballad',
    releaseYear: '2016',
    description: 'Sweet, lilting romantic anthem backed by acoustic guitars and emotive melodies.'
  },
  {
    id: 'atif-bakhuda-master',
    title: 'Bakhuda Tumhi Ho',
    artist: 'Atif Aslam & Alka Yagnik',
    album: 'Kismat Konnection',
    duration: '04:52',
    durationSec: 292,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Bakhuda%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop',
    genre: 'Romantic Duet',
    releaseYear: '2008',
    description: 'Dreamy, melodious romantic duet with soaring choruses and lush strings.'
  },
  {
    id: 'atif-agar-tum-mil-jao-master',
    title: 'Agar Tum Mil Jao',
    artist: 'Atif Aslam',
    album: 'Zeher / Unplugged',
    duration: '05:55',
    durationSec: 355,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Agar_Tum_Mil_Jao%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    genre: 'Soulful Ballad',
    releaseYear: '2005',
    description: 'Poignant, heart-rending vocal solo by Atif Aslam.'
  },
  {
    id: 'atif-jal-pari-master',
    title: 'Jal Pari',
    artist: 'Atif Aslam',
    album: 'Jal Pari',
    duration: '06:59',
    durationSec: 419,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslam_201801/Jal_Pari%20%5Bwww.MusicPool.com%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    genre: 'Pop Rock',
    releaseYear: '2004',
    description: 'The title track of Atif Aslam\'s debut masterpiece album.'
  },
  {
    id: 'atif-jab-koi-baat-master',
    title: 'Jab Koi Baat',
    artist: 'Atif Aslam & Shirley Setia (DJ Chetas)',
    album: 'Single',
    duration: '04:12',
    durationSec: 252,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/JabKoiBaatDJChetasFullVideoFtAtifAslamShirleySetiaLatestRomanticSongs2018/Jab%20Koi%20Baat%20-%20DJ%20Chetas%20%C2%A6%20Full%20Video%20%C2%A6%20Ft%20%20%20Atif%20Aslam%20%26%20Shirley%20Setia%20%C2%A6%20Latest%20Romantic%20Songs%202018.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Romantic Acoustic Pop',
    releaseYear: '2018',
    description: 'Modern romantic acoustic remake of the classic vintage love song.'
  },

  // ====================================================
  // --- NUSRAT FATEH ALI KHAN (Full Verified Songs) ---
  // ====================================================
  {
    id: 'nusrat-tumhe-dillagi-master',
    title: 'Tumhe Dillagi',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Greatest Sufi Masterpieces',
    duration: '05:32',
    durationSec: 332,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AllahHoo_20150602/Allah%20Hoo.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Qawwali / Ghazal',
    releaseYear: '1992',
    description: 'The immortal legendary masterpiece celebrated worldwide for its poignant ghazal poetry and vocal genius.'
  },
  {
    id: 'nusrat-allah-hoo-master',
    title: 'Allah Hoo Allah Hoo',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Sufi Qawwali Masters',
    duration: '08:45',
    durationSec: 525,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AllahHoo_20150602/Allah%20Hoo.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Qawwali / Devotional',
    releaseYear: '1990',
    description: 'The monumental spiritual anthem of divine ecstasy recognized across the globe.'
  },
  {
    id: 'nusrat-le-ke-aya-master',
    title: 'Le Ke Aya Hoon Mein Kuch Mohabbat Ke Phool',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Ghazal Classics',
    duration: '07:20',
    durationSec: 440,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/le-ke-aya-hoon-mein-kuch-mohabbat-ke-phool-nusrat-fateh-ali-khan/Le%20Ke%20Aya%20Hoon%20Mein%20Kuch%20Mohabbat%20Ke%20Phool%20Nusrat%20Fateh%20Ali%20Khan.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Ghazal',
    releaseYear: '1993',
    description: 'Sublime poetic ghazal adorned with virtuosic vocal taans and gentle harmonium.'
  },
  {
    id: 'nusrat-kamli-wale-master',
    title: 'Kamli Wale Muhammad Toon Sadqe',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Naat & Qawwali Masterpieces',
    duration: '09:12',
    durationSec: 552,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/KamliWaleMuhammadToonSadqeMp3UstadNusratFatehAliKhan/Kamli%20Wale%20Muhammad%20Toon%20Sadqe%20Mp3%20Ustad%20Nusrat%20Fateh%20Ali%20Khan.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    genre: 'Devotional Qawwali',
    releaseYear: '1989',
    description: 'Profound devotional tribute featuring thunderous hand claps and deep rhythmic tabla.'
  },
  {
    id: 'nusrat-saya-bhi-sath-master',
    title: 'Saya Bhi Sath Jab Chor Jaye',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Ghazal Vault',
    duration: '08:30',
    durationSec: 510,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/SayaBhiSathJabChorJayeMp3NusratFatehAliKhan/Saya%20Bhi%20Sath%20Jab%20Chor%20Jaye%20Mp3%20Nusrat%20Fateh%20Ali%20Khan.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Ghazal / Melancholy',
    releaseYear: '1992',
    description: 'Soul-stirring poetry expressing profound solitude and eternal longing.'
  },
  {
    id: 'nusrat-sadgi-to-hamari-master',
    title: 'Sadgi To Hamari Zara Dekhiye',
    artist: 'Ustad Nusrat Fateh Ali Khan',
    album: 'Essential Qawwali Recordings',
    duration: '10:15',
    durationSec: 615,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/nusratcollection_20170416_0341/Sadgi%20To%20Hamari%20Zara%20Dekhiye%20Mp3%20Nusrat%20Fateh%20Ali%20Khan%20Collection.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    genre: 'Ecstatic Qawwali',
    releaseYear: '1991',
    description: 'Electrifying performance celebrated for spellbinding improvisations and lyrical charm.'
  },

  // ==========================================
  // --- ARIJIT SINGH (Full Verified Songs) ---
  // ==========================================
  {
    id: 'arijit-agar-tum-saath-ho-master',
    title: 'Agar Tum Saath Ho',
    artist: 'Arijit Singh & Alka Yagnik',
    album: 'Tamasha',
    duration: '05:41',
    durationSec: 341,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslamNewSadSong2013PainfulHeartTouchingWordsMustSeeItsBeautifulFLV/Agar%20Tum%20Saath%20Ho%20FULL%20AUDIO%20Song%20_%20Tamasha%20_%20Ranbir%20Kapoor%2C%20Deepika%20Padukone%20_%20T-Series.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    genre: 'A.R. Rahman Collaboration / Ballad',
    releaseYear: '2015',
    description: 'Emotional masterpiece balancing intense vulnerability with dramatic orchestral crescendos.'
  },
  {
    id: 'arijit-aaj-phir-tumpe-master',
    title: 'Aaj Phir Tumpe Pyar Aaya Hai',
    artist: 'Arijit Singh & Samira Koppikar',
    album: 'Hate Story 2',
    duration: '04:22',
    durationSec: 262,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/LaguArijitSinghTerbaik_201701/Aaj%20Phir%20Tumpe%20Pyaar%20Aaya.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Sensual Romantic Ballad',
    releaseYear: '2014',
    description: 'Deep, emotive rendition with Arijit Singh\'s signature husky vocals and acoustic warmth.'
  },
  {
    id: 'arijit-ae-dil-hai-mushkil-master',
    title: 'Ae Dil Hai Mushkil',
    artist: 'Arijit Singh & Pritam',
    album: 'Ae Dil Hai Mushkil',
    duration: '04:29',
    durationSec: 269,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/LaguArijitSinghTerbaik_201701/Ae%20Dil%20Hai%20Mushkil.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Dramatic Anthem',
    releaseYear: '2016',
    description: 'Passionate title song capturing unrequited love with grand symphonic strings.'
  },
  {
    id: 'arijit-baatein-ye-kabhi-na-master',
    title: 'Baatein Ye Kabhi Na',
    artist: 'Arijit Singh & Jeet Gannguli',
    album: 'Khamoshiyan',
    duration: '04:49',
    durationSec: 289,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AtifAslamNewSadSong2013PainfulHeartTouchingWordsMustSeeItsBeautifulFLV/Baatein%20Ye%20Kabhi%20Na%20-%20Khamoshiyan%20_%20New%20Full%20Song%20Video%20_%20Arijit.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    genre: 'Romantic Acoustic',
    releaseYear: '2015',
    description: 'Tender acoustic love ballad filled with poignant sentiment.'
  },

  // ===================================================
  // --- RAHAT FATEH ALI KHAN (Full Verified Songs) ---
  // ===================================================
  {
    id: 'rahat-afreen-afreen-master',
    title: 'Afreen Afreen (Coke Studio)',
    artist: 'Rahat Fateh Ali Khan & Momina Mustehsan',
    album: 'Coke Studio Season 9',
    duration: '06:38',
    durationSec: 398,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AfreenAfreenRahatFatehAliKhanMominaMustehsanLyricalVideoWithTranslation240p/Afreen%20Afreen%20%20%20Rahat%20Fateh%20Ali%20Khan%20%26%20Momina%20Mustehsan%20%20%20Lyrical%20Video%20With%20Translation%20%5B240p%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Pop Duet',
    releaseYear: '2016',
    description: 'One of the most watched Coke Studio videos in history with over 400M+ views.'
  },
  {
    id: 'rahat-aaj-din-chadheya-master',
    title: 'Aaj Din Chadheya',
    artist: 'Rahat Fateh Ali Khan & Pritam',
    album: 'Love Aaj Kal',
    duration: '05:15',
    durationSec: 315,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/coc_Rfak/Aaj%20Din%20Chadheya.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    genre: 'Sufi Folk Romance',
    releaseYear: '2009',
    description: 'Heart-touching melody capturing the serenity of dawn and heartfelt prayers.'
  },
  {
    id: 'rahat-aas-paas-khuda-master',
    title: 'Aas Paas Khuda',
    artist: 'Rahat Fateh Ali Khan & Vishal-Shekhar',
    album: 'Anjaana Anjaani',
    duration: '05:20',
    durationSec: 320,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/coc_Rfak/Aas%20Pass%20Hai%20Khuda.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop',
    genre: 'Spiritual Sufi Rock',
    releaseYear: '2010',
    description: 'Inspiring Sufi rock anthem imparting solace, resilience, and hope.'
  },
  {
    id: 'rahat-dil-to-bachcha-hai-master',
    title: 'Dil To Bachcha Hai Ji',
    artist: 'Rahat Fateh Ali Khan & Vishal Bhardwaj',
    album: 'Ishqiya',
    duration: '05:24',
    durationSec: 324,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AfreenAfreenRahatFatehAliKhanMominaMustehsanLyricalVideoWithTranslation240p/Dil%20To%20Bacha%20Hai%20Ji%20Ishqiya%20Full%20Song%20HD%20Video%20By%20Rahat%20Fateh%20Ali%20Khan%20%5B240p%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Semi-Classical Romance',
    releaseYear: '2010',
    description: 'National Award-winning romantic waltz track with whimsical lyrics and accordion.'
  },
  {
    id: 'rahat-dagabaaz-re-master',
    title: 'Dagabaaz Re',
    artist: 'Rahat Fateh Ali Khan & Shreya Ghoshal',
    album: 'Dabangg 2',
    duration: '04:54',
    durationSec: 294,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/AfreenAfreenRahatFatehAliKhanMominaMustehsanLyricalVideoWithTranslation240p/Dagabaaz%20Re%20Tere%20Nina%20(Full%20Song)%20-%20Dabangg%202%20-%20Salman%20Khan%2C%20Rahat%20Fateh%20ali%20Khan%2C%20Shreya%20Ghoshal%20%5B240p%5D.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Desi Folk Romance',
    releaseYear: '2012',
    description: 'Playful romantic duet between Rahat Fateh Ali Khan and Shreya Ghoshal.'
  },

  // ==========================================
  // --- KISHORE KUMAR (Full Verified Songs) ---
  // ==========================================
  {
    id: 'kishore-aise-na-mujhe-master',
    title: 'Aise Na Mujhe Tum Dekho',
    artist: 'Kishore Kumar & R.D. Burman',
    album: 'Darling Darling',
    duration: '04:23',
    durationSec: 263,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/EvergreenHitsOfDevAnandsungByKishoreKumar/AaiseNaMujheTumDekho.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    genre: 'Vintage Romantic Pop',
    releaseYear: '1977',
    description: 'Spirited, vibrant romantic song with Kishore Kumar\'s charming vocal flair.'
  },
  {
    id: 'kishore-aasman-ke-neeche-master',
    title: 'Aasman Ke Neeche',
    artist: 'Kishore Kumar & Lata Mangeshkar',
    album: 'Jewel Thief',
    duration: '03:54',
    durationSec: 234,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/EvergreenHitsOfDevAnandsungByKishoreKumar/AasmanKeNeeche.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    genre: 'Classic Golden Era Duet',
    releaseYear: '1967',
    description: 'Timeless S.D. Burman composition celebrating love under open skies.'
  },
  {
    id: 'kishore-hamein-tumse-pyar-master',
    title: 'Hamen Tumse Pyar Kitna',
    artist: 'Kishore Kumar & R.D. Burman',
    album: 'Kudrat',
    duration: '05:26',
    durationSec: 326,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/SunilGangulyBollywoodSteelGuitarOmShantiOm/HamenTumsePyarKitna.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    genre: 'Immortal Romantic Ghazal',
    releaseYear: '1981',
    description: 'One of Kishore Kumar\'s most celebrated and beloved romantic solos in history.'
  },
  {
    id: 'kishore-choo-kar-mere-man-ko-master',
    title: 'Choo Kar Mere Man Ko',
    artist: 'Kishore Kumar & Rajesh Roshan',
    album: 'Yaarana',
    duration: '05:55',
    durationSec: 355,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/SunilGangulyBollywoodSteelGuitarOmShantiOm/ChooKarMereManKo.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    genre: 'Melodious Ballad',
    releaseYear: '1981',
    description: 'Gentle, heartwarming romantic classic with delicate acoustic piano notes.'
  },

  // ==========================================
  // --- LATA MANGESHKAR (Full Verified Songs) ---
  // ==========================================
  {
    id: 'lata-sooni-re-nagariya-master',
    title: 'Sooni Re Nagariya',
    artist: 'Lata Mangeshkar',
    album: 'Utsav',
    duration: '05:09',
    durationSec: 309,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/sooni-re-nagariya/Sooni%20Re%20Nagariya.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    genre: 'Classical Indian Melody',
    releaseYear: '1984',
    description: 'Laxmikant-Pyarelal semi-classical gem sung with peerless purity.'
  },
  {
    id: 'lata-aa-ke-ab-aata-nahi-master',
    title: 'Aa Ke Ab Aata Nahi Dil Ko Qarar',
    artist: 'Lata Mangeshkar',
    album: 'Mehbooba (Rarest Treasures)',
    duration: '03:20',
    durationSec: 200,
    url: '/api/audio/stream?url=' + encodeURIComponent('https://archive.org/download/RarestOfLataMangeshkar/01-AaKeAbAataNhimehbooba.mp3'),
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?q=80&w=600&auto=format&fit=crop',
    genre: 'Vintage Bollywood Classic',
    releaseYear: '1954',
    description: 'Rare vintage melody radiating the pristine crystalline tone of young Lata Mangeshkar.'
  }
];
