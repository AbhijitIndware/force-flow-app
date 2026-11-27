import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { flexCol } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import PageHeader from '../../../components/ui/PageHeader';
import ResultModal, { ResultInfo } from '../../../components/ui/ResultModal';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import { SoAppStackParamList } from '../../../types/Navigation';
import { useApplyLeaveMutation } from '../../../features/base/base-api';
import { LEAVE_DATE_FMT, LEAVE_TYPES } from '../../../types/leaveType';
import {
  getSafeServerMessage,
  getUserFacingError,
  isServerSuccess,
} from '../../../utils/errorMessage';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'ApplyLeaveScreen'>;
  route: RouteProp<SoAppStackParamList, 'ApplyLeaveScreen'>;
};

const DATE_FMT = 'YYYY-MM-DD';

const ApplyLeaveScreen = ({ navigation, route }: Props) => {
  const leaveTypes = route.params?.leaveTypes?.length
    ? route.params.leaveTypes
    : [...LEAVE_TYPES];

  const today = moment().format(DATE_FMT);
  const [leaveType, setLeaveType] = useState<string>(leaveTypes[0]);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayDate, setHalfDayDate] = useState(today);
  const [reason, setReason] = useState('');

  const [applyLeave, { isLoading }] = useApplyLeaveMutation();
  const [result, setResult] = useState<ResultInfo | null>(null);

  const isSingleDay = fromDate === toDate;
  const days = useMemo(() => {
    const d = moment(toDate).diff(moment(fromDate), 'days') + 1;
    if (d <= 0) return 0;
    return isHalfDay ? d - 0.5 : d;
  }, [fromDate, toDate, isHalfDay]);

  // Server rules (balance, monthly cap, back to back, how far back) are
  // checked by apply_leave; its message is shown as-is.
  const showServerError = (msg: string) =>
    setResult({ tone: 'error', title: 'Leave not applied', message: msg });

  const closeResult = () => {
    const wasApplied = result?.tone === 'success';
    setResult(null);
    if (wasApplied) navigation.goBack();
  };

  const submit = async () => {
    if (moment(toDate).isBefore(moment(fromDate))) {
      showServerError('To date can’t be before From date.');
      return;
    }
    if (!reason.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a reason' });
      return;
    }
    const halfDate = isSingleDay ? fromDate : halfDayDate;
    if (
      isHalfDay &&
      (moment(halfDate).isBefore(fromDate) || moment(halfDate).isAfter(toDate))
    ) {
      showServerError('Half day date must be between From and To date.');
      return;
    }
    try {
      const res = await applyLeave({
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        reason: reason.trim(),
        is_half_day: isHalfDay ? 1 : 0,
        ...(isHalfDay ? { half_day_date: halfDate } : {}),
      }).unwrap();
      const msg = getSafeServerMessage(res?.message?.message);
      if (isServerSuccess(res)) {
        setResult({
          tone: 'success',
          title: 'Leave applied',
          message: msg ?? 'Leave applied. Waiting for your manager.',
          buttonLabel: 'Done',
        });
      } else {
        showServerError(msg ?? 'Could not apply the leave.');
      }
    } catch (err: any) {
      showServerError(getUserFacingError(err, 'Could not apply the leave.'));
    }
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Apply for Leave" navigation={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Leave type</Text>
        <View style={styles.typeRow}>
          {leaveTypes.map(t => {
            const active = t === leaveType;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setLeaveType(t)}
                style={[styles.typeChip, active && styles.typeChipActive]}>
                <Text
                  style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <ReusableDatePicker
              displayFormat={LEAVE_DATE_FMT}
              label="From"
              value={fromDate}
              onChange={v => {
                setFromDate(v);
                if (moment(toDate).isBefore(v)) setToDate(v);
                setHalfDayDate(v);
              }}
              labelStyle={styles.label}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ReusableDatePicker
              displayFormat={LEAVE_DATE_FMT}
              label="To"
              value={toDate}
              onChange={v => setToDate(v)}
              labelStyle={styles.label}
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Half day</Text>
            <Text style={styles.switchSub}>
              {isSingleDay
                ? 'Take half of this day'
                : 'One of these days is a half day'}
            </Text>
          </View>
          <Switch
            value={isHalfDay}
            onValueChange={setIsHalfDay}
            trackColor={{ false: '#CBD5E1', true: Colors.darkButton }}
          />
        </View>

        {isHalfDay && !isSingleDay && (
          <ReusableDatePicker
            displayFormat={LEAVE_DATE_FMT}
            label="Half day date"
            value={halfDayDate}
            onChange={v => setHalfDayDate(v)}
            labelStyle={styles.label}
          />
        )}

        <Text style={styles.label}>
          Reason <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Reason for leave"
          placeholderTextColor="#94a3b8"
          value={reason}
          onChangeText={setReason}
          multiline
        />

        <Text style={styles.summary}>
          {days > 0 ? `${days} day${days === 1 ? '' : 's'} of ${leaveType}` : ''}
        </Text>

        <TouchableOpacity
          style={[styles.submit, (isLoading || !reason.trim()) && { opacity: 0.6 }]}
          disabled={isLoading || !reason.trim()}
          onPress={submit}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Apply</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <ResultModal result={result} onClose={closeResult} />
    </SafeAreaView>
  );
};

export default ApplyLeaveScreen;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
    marginBottom: 6,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: Colors.white,
  },
  typeChipActive: {
    backgroundColor: Colors.darkButton,
    borderColor: Colors.darkButton,
  },
  typeChipText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  typeChipTextActive: { color: Colors.white },
  dateRow: { flexDirection: 'row', gap: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  switchTitle: {
    fontFamily: Fonts.medium,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  switchSub: { fontFamily: Fonts.regular, fontSize: 11, color: '#64748b' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: Size.xxs,
    fontFamily: Fonts.regular,
    color: Colors.darkButton,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  summary: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: '#475569',
    marginTop: 10,
  },
  submit: {
    backgroundColor: Colors.darkButton,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.white,
  },
});
