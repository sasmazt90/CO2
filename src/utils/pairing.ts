const canonicalSyncOrigin = 'https://www.co2-score.online';

export const normalizePairingCode = (value: string) => value.trim().toUpperCase();

export const buildPairingDeepLink = (code: string) =>
  `carbonscore://pair?code=${encodeURIComponent(normalizePairingCode(code))}`;

export const buildPairingWebUrl = (code: string, origin = canonicalSyncOrigin) =>
  `${origin.replace(/\/$/, '')}/web?code=${encodeURIComponent(normalizePairingCode(code))}`;

export const extractPairingCode = (input: string) => {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    return null;
  }

  if (!normalizedInput.includes('://')) {
    return normalizePairingCode(normalizedInput);
  }

  try {
    const url = new URL(normalizedInput);
    const code = url.searchParams.get('code');
    return code ? normalizePairingCode(code) : null;
  } catch {
    return null;
  }
};

export const getCurrentWebOrigin = () => {
  if (typeof window === 'undefined') {
    return canonicalSyncOrigin;
  }

  return window.location.origin || canonicalSyncOrigin;
};
