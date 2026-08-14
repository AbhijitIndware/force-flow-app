/* eslint-disable react-native/no-inline-styles */
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {CalendarDays, Clock, Store, X} from 'lucide-react-native';
import moment from 'moment';
import {RosterDay} from '../../../types/baseType';
import {Fonts} from '../../../constants';
import {formatShiftTime, rosterColors} from './rosterTheme';

interface RosterDetailModalProps {
  day: RosterDay | null;
  onClose: () => void;
}

const RosterDetailModal = ({day, onClose}: RosterDetailModalProps) => {
  if (!day) {
    return null;
  }

  const isSplit = day.is_split;
  const shiftColor = isSplit ? rosterColors.splitAccent : '#16a34a';
  const shiftBg = isSplit ? '#FFF7ED' : '#E6F7EE';

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.dateChip}>
                <CalendarDays
                  size={13}
                  color={rosterColors.primary}
                  strokeWidth={1.8}
                />
                <Text style={styles.dateChipText}>
                  {moment(day.date).format('dddd, DD MMMM YYYY')}
                </Text>
              </View>
              <View style={styles.shiftRow}>
                <View
                  style={[
                    styles.shiftBadge,
                    {backgroundColor: shiftBg},
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      {backgroundColor: shiftColor},
                    ]}
                  />
                  <Text
                    style={[
                      styles.shiftBadgeText,
                      {color: shiftColor},
                    ]}>
                    {day.shift_label || (isSplit ? 'Split Shift' : 'Shift')}
                  </Text>
                </View>
                <Text style={styles.slotCount}>
                  {(day.slots ?? []).length} Store
                  {(day.slots ?? []).length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={16} color="#64748b" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Scrollable slot list */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}>
            {(day.slots ?? []).map((slot, i) => {
              const secondary = slot.is_secondary;
              const accent = secondary ? rosterColors.splitAccent : '#16a34a';
              const accentBg = secondary ? '#FFF7ED' : '#E6F7EE';

              return (
                <View key={i} style={styles.slotCard}>
                  <View
                    style={[
                      styles.slotAccent,
                      {backgroundColor: accent},
                    ]}
                  />
                  <View style={styles.slotContent}>
                    <View style={styles.slotHeader}>
                      <Text style={styles.slotIndex}>Slot {i + 1}</Text>
                      <View
                        style={[
                          styles.primaryPill,
                          {backgroundColor: accentBg},
                        ]}>
                        <Text
                          style={[
                            styles.primaryPillText,
                            {color: accent},
                          ]}>
                          {secondary ? 'Secondary' : 'Primary'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.slotType} numberOfLines={1}>
                      {slot.shift_type}
                    </Text>

                    <View style={styles.slotRow}>
                      <Store size={13} color="#64748b" strokeWidth={1.8} />
                      <Text style={styles.storeName} numberOfLines={1}>
                        {slot.store_name}
                      </Text>
                    </View>

                    <View style={styles.timeRow}>
                      <Clock
                        size={13}
                        color={rosterColors.primary}
                        strokeWidth={1.8}
                      />
                      <Text style={styles.timeText}>
                        {formatShiftTime(slot.start_time)} to{' '}
                        {formatShiftTime(slot.end_time)}
                      </Text>
                      <View style={styles.flexSpacer} />
                      <View
                        style={[
                          styles.statusPill,
                          {backgroundColor: '#E6F7EE'},
                        ]}>
                        <View
                          style={[
                            styles.activeDot,
                            {backgroundColor: '#16a34a'},
                          ]}
                        />
                        <Text style={styles.statusText}>{slot.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RosterDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: rosterColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  headerLeft: {gap: 8, flex: 1},
  dateChip: {flexDirection: 'row', alignItems: 'center', gap: 6},
  dateChipText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: rosterColors.titleText,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  shiftBadgeText: {fontFamily: Fonts.medium, fontSize: 13},
  statusDot: {width: 6, height: 6, borderRadius: 3},
  slotCount: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: rosterColors.secondaryText,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {height: 1, backgroundColor: '#F1F5F9', marginBottom: 12},
  scroll: {flexGrow: 0},
  scrollContent: {paddingBottom: 8},
  slotCard: {
    flexDirection: 'row',
    backgroundColor: rosterColors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  slotAccent: {width: 4},
  slotContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  slotIndex: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  primaryPillText: {fontFamily: Fonts.medium, fontSize: 10},
  slotType: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: rosterColors.titleText,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeName: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#334155',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: rosterColors.titleText,
  },
  flexSpacer: {flex: 1},
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeDot: {width: 5, height: 5, borderRadius: 2.5},
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#16a34a',
  },
});
