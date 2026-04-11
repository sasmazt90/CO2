# Digital Carbon Footprint Score

Calm x EcoFusion mobile app for iOS and Android, built with Expo + React Native.

## What is inside

- Shared mobile codebase for iOS and Android
- EcoCalm pastel design system and custom brand assets
- Deterministic rule engine with all 50 requested categories
- 66 total positive/negative outcome rules
- Daily score dashboard, insights, history, challenges, badges, friends, scientific method, and settings screens
- Live signal sync for available device readings plus a Signal Lab calibration screen
- Local battery journal that turns live battery samples into charging-session metrics over time
- Notification Center fed directly by triggered rules, with local device notification scheduling where supported
- Local daily history journal with persisted score snapshots and trend rebuilding
- Segmented social leaderboards, joint challenges, and a shareable weekly card flow
- Runtime permission diagnostics in onboarding and settings
- Collector readiness registry showing live vs estimated vs native-required metric families, plus rule coverage by family
- Platform-by-platform bridge status planner for iOS and Android native collector rollout
- Tooltip info system with reference links
- No external AI APIs

## Run

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
```

## Architecture

- `src/engine/` - score engine, thresholds, and outcome rules
- `src/data/` - mock daily metrics, scientific references, friends, badges, challenges
- `src/screens/` - all app screens
- `src/components/` - reusable UI building blocks
- `src/context/` - onboarding, permissions, challenge state, derived app state

## Rule engine note

Every triggered outcome writes:

- notification
- recommendation
- source attribution
- score impact

into the daily `CarbonScoreBreakdown` object.

## Privacy note

This implementation keeps insights deterministic and local-first. Some mobile behavior signals requested in the product brief are tightly restricted by iOS/Android platform policies, so the current app uses a transparent prototype data layer that can be replaced later by approved native signal collectors where platform access exists.
