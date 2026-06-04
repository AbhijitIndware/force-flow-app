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
import PageHeader from '../../../components/ui/PageHeader';
import CalendarView from '../../../components/weeklyoff/CalendarView';
import Toast from 'react-native-toast-message';

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
      Toast.show({
        type: 'success',
        text1: 'Weekly Off Marked',
        text2: res.message.message,
        position: 'top',
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Mark',
        text2: err?.data?.message ?? 'Something went wrong',
        position: 'top',
      });
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
              Toast.show({
                type: 'success',
                text1: 'Weekly Off Removed',
                text2: res.message.message,
                position: 'top',
              });
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: 'Failed to Remove',
                text2: err?.data?.message ?? 'Something went wrong',
                position: 'top',
              });
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <PageHeader title="Weekly Off" navigation={() => navigation.goBack()} />

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
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusDateLabel}>
                {isToday
                  ? 'Today'
                  : moment(selectedDate).format('ddd, DD MMM YYYY')}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                isSelectedDateOff
                  ? styles.statusPillOff
                  : styles.statusPillWork,
              ]}>
              <View
                style={[
                  styles.statusPillDot,
                  {
                    backgroundColor: isSelectedDateOff
                      ? Colors.textMuted
                      : Colors.success,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  isSelectedDateOff
                    ? styles.statusPillTextOff
                    : styles.statusPillTextWork,
                ]}>
                {isSelectedDateOff ? 'Weekly Off' : 'Working'}
              </Text>
            </View>
          </View>

          <ReusableDatePicker
            label="Select date"
            value={selectedDate}
            onChange={date => setSelectedDate(date)}
            marginBottom={5}
            labelStyle={styles.datePickerLabel}
            inputStyle={styles.datePickerInput}
            height={38}
            textSize={Size.xs}
            // inputStyle={{paddingHorizontal: 2, fontSize: Size.xs}}
          />

          {!isSelectedDateOff ? (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnGreen,
                marking && styles.btnDisabled,
              ]}
              onPress={handleMark}
              disabled={marking}
              activeOpacity={0.85}>
              {marking ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CalendarOff size={15} color="#fff" strokeWidth={1.5} />
              )}
              <Text style={styles.actionBtnText}>Mark as Weekly Off</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnRed,
                cancelling && styles.btnDisabled,
              ]}
              onPress={handleCancel}
              disabled={cancelling}
              activeOpacity={0.85}>
              {cancelling ? (
                <ActivityIndicator size="small" color={Colors.danger} />
              ) : (
                <CalendarOff
                  size={15}
                  color={Colors.danger}
                  strokeWidth={1.5}
                />
              )}
              <Text style={styles.actionBtnTextRed}>Cancel Weekly Off</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* History */}
        <Text style={styles.sectionTitle}>History</Text>
        <View style={styles.card}>
          {historyLoading ? (
            <ActivityIndicator style={{padding: 20}} color={Colors.orange} />
          ) : (
            <CalendarView weeklyOffs={weeklyOffs} />
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
    padding: 5,
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.info,
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
    // fontSize: Size.sm,
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusDateLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillOff: {
    backgroundColor: Colors.lightGray,
    borderColor: Colors.border,
  },
  statusPillWork: {
    backgroundColor: Colors.lightSuccess,
    borderColor: Colors.success + '40',
  },
  statusPillDot: {width: 6, height: 6, borderRadius: 3},
  statusPillText: {fontFamily: Fonts.medium, fontSize: 11},
  statusPillTextOff: {color: Colors.textMuted},
  statusPillTextWork: {color: Colors.success},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnGreen: {backgroundColor: Colors.success},
  actionBtnRed: {
    borderWidth: 1,
    borderColor: Colors.danger + '60',
    backgroundColor: Colors.danger + '08',
  },
  actionBtnText: {fontFamily: Fonts.regular, fontSize: 12, color: '#fff'},
  actionBtnTextRed: {fontFamily: Fonts.regular, fontSize: 12, color: '#fff'},
});
