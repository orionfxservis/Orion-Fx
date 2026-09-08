export interface SubscriptionPackage {
  id: 'free' | 'pro';
  name: string;
  badge: string;
  badgeEmoji: string;
  badgeLabel: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
  launchOffer?: {
    title: string;
    description: string;
    details: string[];
    note: string;
  };
}

export const SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'free',
    name: 'FREE',
    badge: 'START FREE',
    badgeEmoji: '🆓',
    badgeLabel: 'START FREE',
    price: 'Rs. 0',
    period: '/ month',
    tagline: 'Explore MyBeatBox',
    ctaText: 'GET STARTED',
    features: [
      'Music Discovery',
      'Basic Search',
      'Create Playlists'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    badge: '⭐ MOST POPULAR',
    badgeEmoji: '⭐',
    badgeLabel: 'MOST POPULAR',
    price: 'Rs. 499',
    period: '/ month',
    tagline: 'For Creators & Music Lovers',
    recommended: true,
    ctaText: 'REGISTER NOW',
    launchOffer: {
      title: '🎁 THIS OFFER IS VALID FOR THE FIRST 100 USERS',
      description: 'REGISTER NOW GET 1 YEAR FREE SUBSCRIPTION',
      details: [
        '🎁 THIS OFFER IS VALID',
        'FOR THE FIRST 100 USERS',
        'REGISTER NOW',
        'GET 1 YEAR FREE',
        'SUBSCRIPTION'
      ],
      note: 'First-year charges → FREE for the first 100 registered users'
    },
    features: [
      'Everything in Free',
      'Advanced AI Music Discovery',
      'Unlimited Playlists',
      'Advanced Audio Tools',
      'Studio Effects',
      'Priority Processing',
      'High-Quality Export'
    ]
  }
];

export function getPackageById(id: string): SubscriptionPackage {
  return SUBSCRIPTION_PACKAGES.find(p => p.id === id) || SUBSCRIPTION_PACKAGES[1];
}

