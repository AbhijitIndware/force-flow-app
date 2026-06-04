import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import moment from 'moment';
import {CalendarOff, Info, ArrowLeft} from 'lucide-react-native';
import {
  useCancelDayOffMutation,
  useGetDayOffsQuery,
  useMarkDayOffMutation,
} from '../../../features/base/base-api';
import {Colors} from '../../../utils/colors';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import {Fonts} from '../../../constants';
import {Size} from '../../../utils/fontSize';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SoAppStackParamList} from '../../../types/Navigation';

type NavigationProp = NativeStackNavigationProp<
  SoAppStackParamList,
  'WeeklyOffScreen'
>;

type Props = {
  navigation: NavigationProp;
  route: any;
};

const WeeklyOffScreen = ({navigation, route}: Props) => {
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );

  const {data: dayOffsData, isLoading: historyLoading} = useGetDayOffsQuery({});
  const [markDayOff, {isLoading: marking}] = useMarkDayOffMutation();
  const [cancelDayOff, {isLoading: cancelling}] = useCancelDayOffMutation();

  const weeklyOffs: string[] = (dayOffsData?.message?.data ?? []).map(
    d => d.attendance_date,
  );

  const isSelectedDateOff = weeklyOffs.includes(selectedDate);
  const isToday = selectedDate === moment().format('YYYY-MM-DD');

  const handleMark = async () => {
    try {
      const res = await markDayOff({date: selectedDate}).unwrap();
      Alert.alert('Success', res.message.message);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Something went wrong');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Weekly Off',
      `Remove weekly off for ${moment(selectedDate).format('DD MMM YYYY')}?`,
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await cancelDayOff({date: selectedDate}).unwrap();
              Alert.alert('Done', res.message.message);
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.data?.message ?? 'Something went wrong',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <ArrowLeft size={18} color={Colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Off</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Info size={14} color={Colors.info} strokeWidth={1.5} />
          <Text style={styles.infoText}>
            Weekly off cannot be marked if you have already checked in or
            created a PJP for that date.
          </Text>
        </View>

        {/* Mark / Cancel Card */}
        <View style={styles.card}>
          {/* Status Row */}
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>
                {isToday
                  ? "Today's status"
                  : moment(selectedDate).format('ddd, DD MMM YYYY')}
              </Text>
              {isToday && (
                <Text style={styles.cardSub}>
                  {moment(selectedDate).format('dddd, DD MMM YYYY')}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.badge,
                isSelectedDateOff ? styles.badgeOff : styles.badgeWork,
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  isSelectedDateOff
                    ? styles.badgeOffText
                    : styles.badgeWorkText,
                ]}>
                {isSelectedDateOff ? 'Weekly Off' : 'Working'}
              </Text>
            </View>
          </View>

          {/* Date Picker */}
          <ReusableDatePicker
            label="Select date"
            value={selectedDate}
            onChange={date => setSelectedDate(date)}
            marginBottom={16}
            labelStyle={styles.datePickerLabel}
            inputStyle={styles.datePickerInput}
          />

          {/* Action Button */}
          <View style={styles.btnRow}>
            {!isSelectedDateOff ? (
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnPrimary,
                  marking && styles.btnDisabled,
                ]}
                onPress={handleMark}
                disabled={marking}>
                {marking ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CalendarOff size={15} color="#fff" strokeWidth={1.5} />
                )}
                <Text style={styles.btnPrimaryText}>Mark as weekly off</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.btnDanger,
                  cancelling && styles.btnDisabled,
                ]}
                onPress={handleCancel}
                disabled={cancelling}>
                {cancelling ? (
                  <ActivityIndicator size="small" color={Colors.danger} />
                ) : null}
                <Text style={styles.btnDangerText}>Cancel weekly off</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.card}>
          {historyLoading ? (
            <ActivityIndicator style={{padding: 20}} color={Colors.orange} />
          ) : weeklyOffs.length === 0 ? (
            <Text style={styles.emptyText}>No weekly offs recorded yet.</Text>
          ) : (
            (dayOffsData?.message?.data ?? []).map((item, index) => (
              <View
                key={item.name}
                style={[
                  styles.historyItem,
                  index === (dayOffsData?.message?.data?.length ?? 0) - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}>
                <View style={styles.historyIconWrap}>
                  <CalendarOff
                    size={16}
                    color={Colors.success}
                    strokeWidth={1.5}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.historyDate}>
                    {moment(item.attendance_date).format('DD MMM YYYY')}
                  </Text>
                  <Text style={styles.historyDay}>
                    {moment(item.attendance_date).format('dddd')}
                  </Text>
                </View>
                <View style={[styles.badge, styles.badgeOff]}>
                  <Text style={[styles.badgeText, styles.badgeOffText]}>
                    Weekly Off
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};
export default WeeklyOffScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.md,
    color: Colors.text,
  },
  content: {padding: 16, paddingBottom: 32},
  infoBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.infoLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.info,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {fontFamily: Fonts.medium, fontSize: 15, color: Colors.text},
  cardSub: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
  badgeOff: {backgroundColor: Colors.lightSuccess},
  badgeWork: {backgroundColor: Colors.lightGray},
  badgeText: {fontFamily: Fonts.medium, fontSize: 12},
  badgeOffText: {color: Colors.success},
  badgeWorkText: {color: Colors.textMuted},
  datePickerLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  datePickerInput: {
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    color: Colors.text,
  },
  btnRow: {flexDirection: 'row', gap: 10},
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPrimary: {backgroundColor: Colors.success},
  btnDanger: {borderWidth: 0.5, borderColor: Colors.danger},
  btnDisabled: {opacity: 0.5},
  btnPrimaryText: {fontFamily: Fonts.medium, fontSize: 14, color: '#fff'},
  btnDangerText: {fontFamily: Fonts.medium, fontSize: 14, color: Colors.danger},
  sectionTitle: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightSuccess,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDate: {fontFamily: Fonts.medium, fontSize: 14, color: Colors.text},
  historyDay: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
