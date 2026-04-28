# Launch Checklist

## Ads privacy and attribution

- Current ad delivery is configured for real banner units with non-personalized requests only.
- `NSUserTrackingUsageDescription`, `GADApplicationIdentifier`, and an initial `SKAdNetworkItems` set have been added.
- Review whether ATT for IDFA access is actually needed before launch. If yes, implement the runtime prompt before loading personalized ads.
- Review whether Google UMP consent flow is needed for your launch regions before enabling personalized ads.
- Keep the `SKAdNetworkItems` buyer list in sync with the latest Google guidance before App Store submission.

## Desktop sync release

- Desktop web sync is now aligned to `https://www.co2-score.online/web`.
- Verify manual code and QR pairing on a real iPhone and Android device.
- Confirm deep link handling for `carbonscore://pair?code=...`.
