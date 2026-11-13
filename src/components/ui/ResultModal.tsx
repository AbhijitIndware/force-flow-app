import React from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';

export type ResultTone = 'success' | 'warning' | 'error';

export type ResultInfo = {
  tone: ResultTone;
  title: string;
  message?: string;
  /** Item-level notes, shown as a list. */
  points?: string[];
  buttonLabel?: string;
  /** A second, main button, e.g. "Edit PJP". The close button then reads "Later". */
  action?: {label: string; onPress: () => void};
};

type Props = {
  result: ResultInfo | null;
  onClose: () => void;
};

const TONES: Record<
  ResultTone,
  {icon: string; color: string; bg: string; button: string}
> = {
  success: {
    icon: 'checkmark-circle',
    color: '#15803D',
    bg: '#DCFCE7',
    button: Colors.darkButton,
  },
  warning: {
    icon: 'alert-circle',
    color: '#B45309',
    bg: '#FEF3C7',
    button: Colors.darkButton,
  },
  error: {
    icon: 'close-circle',
    color: '#B91C1C',
    bg: '#FEE2E2',
    button: '#B91C1C',
  },
};

// The outcome of a save, in a centred card: icon, title, a plain sentence
// and, when the server has notes, one line per note.
const ResultModal = ({result, onClose}: Props) => {
  const tone = TONES[result?.tone ?? 'success'];
  return (
    <Modal
      visible={!!result}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        {result ? (
          <View style={styles.card}>
            <View style={[styles.iconWrap, {backgroundColor: tone.bg}]}>
              <Ionicons name={tone.icon} size={34} color={tone.color} />
            </View>
            <Text style={styles.title}>{result.title}</Text>
            {result.message ? (
              <Text style={styles.message}>{result.message}</Text>
            ) : null}
            {result.points?.length ? (
              <View style={[styles.points, {borderColor: tone.bg}]}>
                {result.points.map(point => (
                  <View key={point} style={styles.pointRow}>
                    <View
                      style={[styles.bullet, {backgroundColor: tone.color}]}
                    />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {result.action ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onClose}>
                  <Text style={styles.secondaryText}>
                    {result.buttonLabel ?? 'Later'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.mainButton,
                    {backgroundColor: Colors.darkButton},
                  ]}
                  onPress={() => {
                    // Action first, so onClose can tell it apart from "Later".
                    result.action?.onPress();
                    onClose();
                  }}>
                  <Text style={styles.buttonText}>{result.action.label}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, {backgroundColor: tone.button}]}
                onPress={onClose}>
                <Text style={styles.buttonText}>
                  {result.buttonLabel ?? 'OK'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    color: '#111827',
    fontSize: 17,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.regular,
    color: '#475569',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  points: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    gap: 6,
  },
  pointRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
  bullet: {width: 6, height: 6, borderRadius: 3, marginTop: 7},
  pointText: {
    flex: 1,
    fontFamily: Fonts.regular,
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    alignSelf: 'stretch',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonRow: {flexDirection: 'row', gap: 10, alignSelf: 'stretch'},
  secondaryButton: {
    flex: 1,
    alignSelf: 'auto',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  mainButton: {flex: 1.4, alignSelf: 'auto'},
  secondaryText: {
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 14,
  },
  buttonText: {fontFamily: Fonts.semiBold, color: Colors.white, fontSize: 14},
});

export default ResultModal;
