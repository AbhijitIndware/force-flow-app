import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Fonts} from '../../../../constants';
import {DistributorDetails} from '../../../../types/baseType';
import {Colors} from '../../../../utils/colors';
import {InfoRow, Section} from '../Store/StoreDetailComponent';

type Props = {
  distributor: DistributorDetails;
  navigation: any;
};

const DistributorDetailComponent = ({distributor, navigation}: Props) => {
  return (
    <View style={styles.container}>
      {/* ---------- Header Card ---------- */}
      <View style={styles.headerCard}>
        <Text style={styles.distributorName}>
          {distributor.distributor_name}
        </Text>

        {distributor.can_edit && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate('AddDistributorScreen', {
                distributorId: distributor.name,
              })
            }>
            <Icon name="edit" size={20} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <Section title="Basic Info" icon="business">
        <InfoRow label="Name" value={distributor.distributor_name} />
        <InfoRow label="Group" value={distributor.distributor_group} />
        <InfoRow label="Distributor Code" value={distributor.distributor_code} />
        <InfoRow label="SAP Code" value={distributor.distributor_sap_code} />
        <InfoRow label="Mobile" value={distributor.mobile} />
        <InfoRow label="Email" value={distributor.email} />
      </Section>

      {/* -------- Location -------- */}
      <Section title="Location" icon="location-on">
        <InfoRow label="Zone" value={distributor.zone} />
        <InfoRow label="State" value={distributor.state} />
        <InfoRow label="City" value={distributor.city} />
      </Section>

      {/* -------- Stores -------- */}
      <Section title="Stores" icon="store">
        <InfoRow label="Stores" value={distributor.store_count} />
      </Section>
    </View>
  );
};

export default DistributorDetailComponent;

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

  distributorName: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.medium,
  },

  editBtn: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 8,
  },
});
