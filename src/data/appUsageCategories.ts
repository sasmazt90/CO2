export type AppUsageCategoryId =
  | 'social'
  | 'video'
  | 'music'
  | 'navigation'
  | 'camera'
  | 'ar';

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
  {
    id: 'music',
    title: 'Music & Audio Apps',
    description:
      'Feeds music listening time and expands audio-side energy scoring.',
    metric: 'musicListeningTime',
    exactPackages: [
      'com.spotify.music',
      'com.apple.android.music',
      'com.google.android.apps.youtube.music',
      'deezer.android.app',
      'com.soundcloud.android',
      'com.amazon.mp3',
      'com.bandcamp.android',
      'com.pandora.android',
      'com.aspiro.tidal',
    ],
    packagePatterns: [
      'spotify',
      'music',
      'soundcloud',
      'deezer',
      'tidal',
      'pandora',
      'bandcamp',
      'audio',
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation Apps',
    description:
      'Feeds navigation usage and mobility-related energy scoring.',
    metric: 'navigationTime',
    exactPackages: [
      'com.google.android.apps.maps',
      'com.waze',
      'com.here.app.maps',
      'com.tomtom.gplay.navapp',
      'com.mapbox.mapboxandroiddemo',
      'com.sygic.aura',
    ],
    packagePatterns: ['maps', 'waze', 'nav', 'navigation', 'sygic', 'tomtom'],
  },
  {
    id: 'camera',
    title: 'Camera Apps',
    description:
      'Feeds camera usage and improves processing-side metric coverage.',
    metric: 'cameraUsage',
    exactPackages: [
      'com.android.camera',
      'com.google.android.GoogleCamera',
      'com.sec.android.app.camera',
      'com.oplus.camera',
      'com.oneplus.camera',
      'com.miui.camera',
    ],
    packagePatterns: ['camera', 'cam', 'gcam'],
  },
  {
    id: 'ar',
    title: 'AR & Spatial Apps',
    description:
      'Feeds AR usage through known motion- and camera-heavy app patterns.',
    metric: 'arAppUsage',
    exactPackages: [
      'com.nianticlabs.pokemongo',
      'com.snapchat.android',
      'com.google.ar.core',
      'com.microsoft.mesh',
      'com.ikea.place',
    ],
    packagePatterns: ['arcore', 'pokemon', 'augmented', 'ar.', 'spatial'],
  },
];

export const summarizeAppUsageCategoryRegistry = () =>
  appUsageCategories.map((category) => ({
    ...category,
    totalMatchers: category.exactPackages.length + category.packagePatterns.length,
  }));
