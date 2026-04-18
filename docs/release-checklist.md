# Release Checklist

## iOS

- Confirm Apple Developer team access
- Attach signing credentials in EAS
- Confirm production env vars exist in EAS
- Run `npm run build:ios`
- Verify notifications, location, motion, and usage fallbacks on a real device
- Prepare App Store privacy answers and screenshots
- Submit with `npm run submit:ios`

## Android

- Attach Play signing credentials in EAS
- Confirm production env vars exist in EAS
- Run `npm run build:android`
- Verify usage access bridge, notifications, location, and motion on a real device
- Prepare Play Console store listing and privacy form
- Submit with `npm run submit:android`

## Cross-platform verification

- Confirm Supabase sync is working for profile, history, and challenge state
- Confirm Metric Readiness reflects device profile changes
- Confirm desktop sync round-trips state between two installs
- Confirm notification center and scheduled local notifications behave correctly
