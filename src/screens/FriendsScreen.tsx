import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeMedal } from '../components/BadgeMedal';
import { FriendCard } from '../components/FriendCard';
import { InlineAdBanner } from '../components/InlineAdBanner';
import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SharePreviewCard } from '../components/SharePreviewCard';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { createBadges } from '../data/friends';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const leaderboardTabs = [
  { id: 'city', label: 'City' },
  { id: 'region', label: 'Region' },
  { id: 'country', label: 'Country' },
  { id: 'world', label: 'World' },
] as const;

export const FriendsScreen = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof leaderboardTabs)[number]['id']>('city');
  const [selectedBadgeId, setSelectedBadgeId] = React.useState<string | null>(null);
  const { badges, leaderboards, socialProfile, streakDays, todayBreakdown, weeklyAverageScore } =
    useAppContext();
  const allBadges = createBadges();
  const unlockedBadgeIds = new Set(badges.map((badge) => badge.id));
  const selectedBadge = allBadges.find((badge) => badge.id === selectedBadgeId);

  const leaderboardData =
    activeTab === 'city'
      ? leaderboards.city.filter((friend) => friend.city === socialProfile.city)
      : activeTab === 'region'
        ? leaderboards.regional
        : activeTab === 'country'
          ? leaderboards.country
          : leaderboards.global;

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Share card" subtitle="A clean weekly snapshot you can share with friends" />
        <SharePreviewCard
          badge={badges[0]}
          score={todayBreakdown.score}
          streak={streakDays}
          weeklyAverage={weeklyAverageScore}
        />
      </SurfaceCard>

      <SurfaceCard>
        <SectionTitle title="Trophies" subtitle="Where your footprint score ranks against wider circles" />
        <View style={styles.tabRow}>
          {leaderboardTabs.map((tab) => (
            <Text
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            >
              {tab.label}
            </Text>
          ))}
        </View>
        <View style={styles.leaderboardList}>
          {leaderboardData.slice(0, 5).map((friend, index) => (
            <FriendCard key={`${activeTab}-${friend.id}`} friend={friend} index={index} />
          ))}
        </View>
      </SurfaceCard>

      <InlineAdBanner placement="friendsBanner" />

      <SurfaceCard>
        <SectionTitle title="Badge cabinet" subtitle="Unlocked badges stay bright, locked badges stay muted" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeRow}>
          {allBadges.map((badge) => (
            <BadgeMedal
              key={badge.id}
              badge={badge}
              unlocked={unlockedBadgeIds.has(badge.id)}
              onPress={() => setSelectedBadgeId(badge.id)}
            />
          ))}
        </ScrollView>
        <Text style={styles.badgeNote}>
          Tap any badge to see how to earn it.
        </Text>
      </SurfaceCard>

      <Modal animationType="fade" transparent visible={selectedBadge !== undefined}>
        <View style={styles.modalOverlay}>
          <View style={styles.badgeModal}>
            <Pressable onPress={() => setSelectedBadgeId(null)} style={styles.modalClose}>
              <Ionicons color={colors.forestInk} name="close-outline" size={22} />
            </Pressable>
            {selectedBadge ? (
              <>
                <BadgeMedal
                  badge={selectedBadge}
                  unlocked={unlockedBadgeIds.has(selectedBadge.id)}
                />
                <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
                <Text style={styles.modalMeta}>
                  {selectedBadge.level} | {unlockedBadgeIds.has(selectedBadge.id) ? 'Unlocked' : 'Locked'}
                </Text>
                <Text style={styles.modalBody}>{selectedBadge.howToEarn}</Text>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tab: {
    borderColor: colors.softTeal,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.softTeal,
    color: colors.softWhite,
  },
  leaderboardList: {
    gap: spacing.sm,
  },
  badgeRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  badgeNote: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(26,31,28,0.2)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  badgeModal: {
    alignItems: 'center',
    backgroundColor: colors.softWhite,
    borderRadius: 24,
    gap: spacing.sm,
    padding: spacing.lg,
    width: '100%',
  },
  modalClose: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 20,
    textAlign: 'center',
  },
  modalMeta: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  modalBody: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
