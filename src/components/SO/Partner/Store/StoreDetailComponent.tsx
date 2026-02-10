import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Fonts} from '../../../../constants';
import {StoreDataById} from '../../../../types/baseType';
import {Colors} from '../../../../utils/colors';

type Props = {
  store: StoreDataById;
  navigation: any;
};

/* ---------- Info Row ---------- */

const InfoRow = ({label, value}: {label: string; value?: any}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value} numberOfLines={2}>
      {value ?? '—'}
    </Text>
  </View>
);

/* ---------- Section Card ---------- */

const Section = ({title, icon, children}: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={18} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

/* ---------- Component ---------- */

const StoreDetailComponent = ({store, navigation}: Props) => {
  return (
    <View style={styles.container}>
      {/* ---------- Header Card ---------- */}
      <View style={styles.headerCard}>
        <View style={{flex: 1}}>
          <Text style={styles.storeName}>{store.store_name}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{store.status}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate('AddStoreScreen', {
              storeId: store?.name,
            })
          }>
          <Icon name="edit" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* -------- Basic Info -------- */}
      <Section title="Basic Info" icon="store">
        <InfoRow label="Type" value={store.store_type} />
        <InfoRow label="Category" value={store.store_category} />
        {/* <InfoRow label="Beat" value={store.beat} /> */}
      </Section>

      {/* -------- Location -------- */}
      <Section title="Location" icon="location-on">
        <InfoRow label="Zone" value={store.zone} />
        <InfoRow label="State" value={store.state} />
        <InfoRow label="City" value={store.city} />
        <InfoRow label="Address" value={store.address} />
        <InfoRow label="Map" value={store.map_location} />
      </Section>

      {/* -------- Compliance -------- */}
      <Section title="Compliance" icon="verified">
        <InfoRow label="PAN" value={store.pan_no} />
        <InfoRow label="GST" value={store.gst_no} />
        <InfoRow label="Distributor" value={store.distributor} />
      </Section>

      {/* -------- NP Scheme -------- */}
      {/* <Section title="NP Scheme" icon="trending-up">
        <InfoRow label="Scheme No" value={store.np_scheme_number} />
        <InfoRow label="PO Start" value={store.np_po_value_start} />
        <InfoRow label="PO End" value={store.np_po_value_end} />
        <InfoRow label="Monthly Target" value={store.np_po_monthly_target} />
      </Section> */}

      {/* -------- OP Scheme -------- */}
      {/* <Section title="OP Scheme" icon="assessment">
        <InfoRow label="Scheme No" value={store.op_scheme_number} />
        <InfoRow label="PO Start" value={store.op_po_value_start} />
        <InfoRow label="PO End" value={store.op_po_value_end} />
        <InfoRow label="Monthly Target" value={store.op_po_monthly_target} />
      </Section> */}

      {/* -------- Employee -------- */}
      <Section title="Created By" icon="person">
        <InfoRow label="Employee" value={store.created_by_employee_name} />
        <InfoRow
          label="Designation"
          value={store.created_by_employee_designation}
        />
        <InfoRow label="Reports To" value={store.reports_to_name} />
      </Section>
    </View>
  );
};

export default StoreDetailComponent;

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },

  storeName: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    marginBottom: 6,
    width: '95%',
  },

  statusBadge: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: Fonts.medium,
  },

  editBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
  },

  section: {
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },

  value: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    flex: 1,
    textAlign: 'right',
  },
});
