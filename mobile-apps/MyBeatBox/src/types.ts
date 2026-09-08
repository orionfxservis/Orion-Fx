export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // MM:SS formatted string
  durationSec: number;
  url: string;
  coverUrl: string;
  genre: string;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdByName: string;
  userEmail?: string;
  isCollaborative: boolean;
  songs: Song[];
  members: string[]; // usernames or sessionIds of members currently active or added
  createdAt: number;
}

export type AppTab = 'home' | 'discover' | 'library' | 'studio' | 'ai';

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  favoriteGenres: string[];
  packageTier?: 'free' | 'pro';
}

export interface RecommendationResponse {
  recommendations: {
    title: string;
    artist: string;
    reason: string;
    genre: string;
    vibe: string;
  }[];
}

export interface ChatMessage {
  id: string;
  playlistId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export type ThemeId = 'obsidian' | 'cyberpunk' | 'midnight-gold' | 'vaporwave' | 'crimson' | 'arctic-azure' | 'solar-sunset' | 'custom';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardClass: string;
  accentClass: string;
  textClass: string;
  mutedTextClass: string;
  borderClass: string;
  primaryButtonClass: string;
  sliderAccentColor: string;
  customAccentHex?: string;
  customBgHex?: string;
}
