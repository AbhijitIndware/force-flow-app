import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {ExpenseItem, ExpenseClaim} from '../../../types/baseType';
import {windowHeight} from '../../../utils/utils';
import {Colors} from '../../../utils/colors';
import moment from 'moment';

const ExpenseClaimDetail = ({
  expenseData,
  data,
}: {
  expenseData: ExpenseItem;
  data: ExpenseClaim;
}) => {
  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16}}>
      <View style={styles.card}>
        {/* ---------------- BASIC DETAILS ---------------- */}
        <Text style={[styles.sectionTitle, {marginTop: 10}]}>
          Basic Information
        </Text>

        <InfoRow label="Expense Type" value={expenseData.expense_type} />
        <InfoRow label="Expense Date" value={expenseData.expense_date} />
        <InfoRow label="Description" value={expenseData.description || '—'} />
        <InfoRow
          label="User Description"
          value={expenseData.custom_claim_description || '—'}
        />

        {/* ---------------- CLAIM DETAILS ---------------- */}
        <Text style={styles.sectionTitle}>Claim Information</Text>
        <StatusRow label="Status" status={data.approval_status} />

        <InfoRow label="Company" value={data.company} />
        <InfoRow label="Employee" value={data.employee_name} />
        <InfoRow label="Employee ID" value={data.employee} />

        {/* ---------------- AMOUNT ---------------- */}
        <Text style={styles.sectionTitle}>Amount Details</Text>

        <AmountBlock
          label="Claim Amount"
          amount={expenseData.amount}
          color={Colors.primary}
        />
        <AmountBlock
          label="Sanctioned Amount"
          amount={expenseData.sanctioned_amount}
          color={Colors.success}
        />

        {/* ---------------- TELECOM SECTION (Conditional) ---------------- */}
        {/* {(expenseData.custom_telecom_handset_cost > 0 ||
          expenseData.custom_telecom_isd_amount > 0 ||
          expenseData.custom_telecom_late_fee > 0 ||
          expenseData.custom_telecom_other_disallowed > 0) && (
          <>
            <Text style={styles.sectionTitle}>Telecom Details</Text>
            <InfoRow
              label="Handset Cost"
              value={`₹ ${expenseData.custom_telecom_handset_cost}`}
            />
            <InfoRow
              label="ISD Amount"
              value={`₹ ${expenseData.custom_telecom_isd_amount}`}
            />
            <InfoRow
              label="Late Fee"
              value={`₹ ${expenseData.custom_telecom_late_fee}`}
            />
            <InfoRow
              label="Other Disallowed"
              value={`₹ ${expenseData.custom_telecom_other_disallowed}`}
            />
          </>
        )} */}

        {/* ---------------- TRAVEL SECTION ---------------- */}
        {/* <Text style={styles.sectionTitle}>Travel Details</Text>

        <InfoRow
          label="Is Local?"
          value={expenseData.custom_is_local ? 'Yes' : 'No'}
        />
        {expenseData.custom_is_promotional !== undefined && (
          <InfoRow
            label="Promotional Travel"
            value={expenseData.custom_is_promotional ? 'Yes' : 'No'}
          />
        )}
        <InfoRow
          label="KM Travelled"
          value={`${expenseData.custom_ta_km} KM`}
        />
        <InfoRow
          label="Travel Mode"
          value={expenseData.custom_ta_mode || '—'}
        /> */}

        <Text style={styles.sectionTitle}>Travel Details</Text>

        <InfoRow label="Travel Type" value={data.custom_travel_type || '—'} />
        <InfoRow label="From City" value={data.custom_from_city || '—'} />
        <InfoRow label="To City" value={data.custom_to_city || '—'} />
        <InfoRow label="City Class" value={data.custom_city_class || '—'} />

        <InfoRow
          label="Travel Start Date"
          value={moment(data.custom_travel_start_date).format('DD MMM YYYY')}
        />
        <InfoRow
          label="Travel End Date"
          value={moment(data.custom_travel_end_date).format('DD MMM YYYY')}
        />

        <InfoRow label="Days" value={String(data.custom_days)} />
        <InfoRow
          label="Distance (KM)"
          value={`${data.custom_distance_km} KM`}
        />

        {/* ---------------- AUDIT DETAILS ---------------- */}
        <Text style={styles.sectionTitle}>Audit Info</Text>

        <InfoRow
          label="Created On"
          value={moment(expenseData.creation).format('DD MMM YYYY, hh:mm A')}
        />

        <InfoRow
          label="Modified On"
          value={moment(expenseData.modified).format('DD MMM YYYY, hh:mm A')}
        />

        <InfoRow label="Owner" value={expenseData.owner} />
      </View>
    </ScrollView>
  );
};

export default ExpenseClaimDetail;

/* ---------------- REUSABLE COMPONENTS ---------------- */

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Approved':
      return {
        bg: '#E6F4EA',
        text: '#1E7F43',
      };
    case 'Rejected':
      return {
        bg: '#FDEAEA',
        text: '#B42318',
      };
    case 'Draft':
      return {
        bg: '#FFF4E5',
        text: '#B54708',
      };
    default:
      return {
        bg: '#EDEDED',
        text: '#333',
      };
  }
};

const InfoRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const AmountBlock = ({
  label,
  amount,
  color,
}: {
  label: string;
  amount: number;
  color: string;
}) => (
  <View style={styles.amountContainer}>
    <Text style={styles.amountLabel}>{label}</Text>
    <Text style={[styles.amountValue]}>{`₹ ${amount}`}</Text>
  </View>
);

const StatusRow = ({label, status}: {label: string; status: string}) => {
  const colors = getStatusStyle(status);

  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.statusBadge, {backgroundColor: colors.bg}]}>
        <Text style={[styles.statusText, {color: colors.text}]}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    minHeight: windowHeight * 0.7,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginTop: 22,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#F1F1F1',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
    color: Colors.black,
  },

  amountContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.sucess,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },

  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
