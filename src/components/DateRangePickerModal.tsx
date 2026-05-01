import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatShortDate } from '../utils/formatters';

export interface DateRangeValue {
  start: string;
  end: string;
}

const toIso = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getMonthGrid = (month: Date) => {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<string | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toIso(new Date(month.getFullYear(), month.getMonth(), day)));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const DateRangePickerModal = ({
  onApply,
  open,
  onClose,
  value,
}: {
  onApply: (next: DateRangeValue) => void;
  open: boolean;
  onClose: () => void;
  value: DateRangeValue;
}) => {
  const [draft, setDraft] = useState<DateRangeValue>(value);
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(value.end));

  React.useEffect(() => {
    if (open) {
      setDraft(value);
      setVisibleMonth(new Date(value.end));
      setSelecting('start');
    }
  }, [open, value]);

  const months = useMemo(
    () => [
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1),
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
    ],
    [visibleMonth],
  );

  const pickDate = (dateIso: string) => {
    if (selecting === 'start') {
      const nextEnd = dateIso > draft.end ? dateIso : draft.end;
      setDraft({ start: dateIso, end: nextEnd });
      setSelecting('end');
      return;
    }

    const sorted = [draft.start, dateIso].sort();
    setDraft({ start: sorted[0], end: sorted[1] });
  };

  const applyShortcut = (days: number) => {
    const end = new Date();
    const start = addDays(end, -(days - 1));
    setDraft({ start: toIso(start), end: toIso(end) });
  };

  return (
    <Modal animationType="slide" transparent visible={open}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Compare period</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons color={colors.forestInk} name="close-outline" size={22} />
            </Pressable>
          </View>

          <View style={styles.shortcutRow}>
            <Pressable onPress={() => applyShortcut(7)} style={styles.shortcut}>
              <Text style={styles.shortcutText}>Weekly</Text>
            </Pressable>
            <Pressable onPress={() => applyShortcut(30)} style={styles.shortcut}>
              <Text style={styles.shortcutText}>Monthly</Text>
            </Pressable>
          </View>

          <View style={styles.selectionRow}>
            <Pressable
              onPress={() => setSelecting('start')}
              style={[styles.selectionChip, selecting === 'start' && styles.selectionChipActive]}
            >
              <Text style={styles.selectionLabel}>Start</Text>
              <Text style={styles.selectionValue}>{formatShortDate(draft.start)}</Text>
            </Pressable>
            <Pressable
              onPress={() => setSelecting('end')}
              style={[styles.selectionChip, selecting === 'end' && styles.selectionChipActive]}
            >
              <Text style={styles.selectionLabel}>End</Text>
              <Text style={styles.selectionValue}>{formatShortDate(draft.end)}</Text>
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            <Pressable
              onPress={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                )
              }
              style={styles.iconButton}
            >
              <Ionicons color={colors.forestInk} name="chevron-back-outline" size={18} />
            </Pressable>
            <Pressable
              onPress={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                )
              }
              style={styles.iconButton}
            >
              <Ionicons color={colors.forestInk} name="chevron-forward-outline" size={18} />
            </Pressable>
          </View>

          <ScrollView style={styles.calendarScroll} contentContainerStyle={styles.calendarContent}>
            {months.map((month) => (
              <View key={`${month.getFullYear()}-${month.getMonth()}`} style={styles.month}>
                <Text style={styles.monthTitle}>
                  {month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <View style={styles.weekRow}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label) => (
                    <Text key={label} style={styles.weekDay}>
                      {label}
                    </Text>
                  ))}
                </View>
                <View style={styles.grid}>
                  {getMonthGrid(month).map((cell, index) => {
                    if (!cell) {
                      return <View key={`empty-${index}`} style={styles.dayCell} />;
                    }

                    const selected = cell >= draft.start && cell <= draft.end;

                    return (
                      <Pressable
                        key={cell}
                        onPress={() => pickDate(cell)}
                        style={[styles.dayCell, selected && styles.dayCellActive]}
                      >
                        <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                          {new Date(cell).getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={styles.applyButton}
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(26,31,28,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.softWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: spacing.md,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  calendarScroll: {
    maxHeight: 360,
  },
  calendarContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.title,
    fontSize: 22,
  },
  iconButton: {
    alignItems: 'center',
    borderColor: 'rgba(160,167,162,0.16)',
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shortcut: {
    backgroundColor: 'rgba(143,215,200,0.16)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shortcutText: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectionChip: {
    borderColor: 'rgba(160,167,162,0.16)',
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  selectionChipActive: {
    borderColor: colors.softTeal,
    backgroundColor: 'rgba(143,215,200,0.08)',
  },
  selectionLabel: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
  selectionValue: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    marginTop: spacing.xxs,
  },
  monthNav: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  month: {
    gap: spacing.sm,
  },
  monthTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    color: colors.warmGray,
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayCellActive: {
    backgroundColor: colors.softTeal,
  },
  dayText: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
  },
  dayTextActive: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: colors.softTeal,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  applyText: {
    color: colors.softWhite,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
});
