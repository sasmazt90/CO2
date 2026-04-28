import React from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

import { useAppContext } from '../context/AppContext';
import { extractPairingCode } from '../utils/pairing';

export const IncomingPairLinkHandler = () => {
  const { pairDesktopByCode } = useAppContext();
  const incomingUrl = Linking.useURL();
  const handledUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!incomingUrl || incomingUrl === handledUrlRef.current) {
      return;
    }

    const code = extractPairingCode(incomingUrl);

    if (!code) {
      return;
    }

    handledUrlRef.current = incomingUrl;
    void pairDesktopByCode(code)
      .then(() => {
        Alert.alert('Desktop paired', 'This phone is now linked to your desktop sync profile.');
      })
      .catch(() => {
        Alert.alert('Pairing failed', 'The QR code was read, but the desktop profile could not be paired.');
      });
  }, [incomingUrl, pairDesktopByCode]);

  return null;
};
