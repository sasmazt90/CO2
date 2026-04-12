export type AppUsageCategoryId = 'social' | 'video';

export interface AppUsageCategoryDefinition {
  id: AppUsageCategoryId;
  title: string;
  description: string;
  metric: string;
  exactPackages: string[];
  packagePatterns: string[];
}

export const appUsageCategories: AppUsageCategoryDefinition[] = [
  {
    id: 'social',
    title: 'Social Apps',
    description:
      'Feeds social media time and parts of heavy-open behavior scoring.',
    metric: 'socialMediaTime',
    exactPackages: [
      'com.instagram.android',
      'com.zhiliaoapp.musically',
      'com.snapchat.android',
      'com.facebook.katana',
      'com.facebook.orca',
      'com.reddit.frontpage',
      'com.linkedin.android',
      'com.twitter.android',
      'com.threadsapp',
      'com.pinterest',
      'com.discord',
      'org.telegram.messenger',
      'com.whatsapp',
    ],
    packagePatterns: [
      'instagram',
      'facebook',
      'tiktok',
      'snapchat',
      'twitter',
      'reddit',
      'linkedin',
      'pinterest',
      'threads',
      'discord',
      'telegram',
      'whatsapp',
      'messenger',
    ],
  },
  {
    id: 'video',
    title: 'Video & Streaming Apps',
    description:
      'Feeds streaming time and supports higher-impact media usage guidance.',
    metric: 'videoStreamingTime',
    exactPackages: [
      'com.google.android.youtube',
      'com.netflix.mediaclient',
      'tv.twitch.android.app',
      'com.disney.disneyplus',
      'com.amazon.avod.thirdpartyclient',
      'com.hulu.plus',
      'com.wbd.stream',
      'com.google.android.videos',
      'org.videolan.vlc',
      'com.plexapp.android',
      'com.google.android.apps.youtube.music',
    ],
    packagePatterns: [
      'youtube',
      'netflix',
      'primevideo',
      'amazon.avod',
      'disney',
      'twitch',
      'hulu',
      'stream',
      'vlc',
      'plex',
      'video',
      'player',
    ],
  },
];

export const summarizeAppUsageCategoryRegistry = () =>
  appUsageCategories.map((category) => ({
    ...category,
    totalMatchers: category.exactPackages.length + category.packagePatterns.length,
  }));
