import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {Colors} from '../../utils/colors';
import {Fonts} from '../../constants';

// One figure of a row. With `old`, a correction shows "old → new".
// The label becomes the column heading (taken from the first row).
export type ConfirmFigure = {
  label?: string;
  value: number | string;
  old?: number | string;
  /** A wider column, e.g. an amount in ₹. */
  wide?: boolean;
};

export type ConfirmRow = {
  key: string;
  name: string;
  figures: ConfirmFigure[];
  /** Small grey lines under the name, e.g. "left on shelf after: 4". */
  lines?: string[];
  /** Taken off the entry by a correction: shown struck out. */
  removed?: boolean;
};

export type ConfirmSpec = {
  /** "Receive Stock · Sonamukhi Store · 9 Nov 2026" */
  header: string;
  title?: string;
  /** e.g. "Correcting the entry of 5 Nov, 12:40" */
  subheader?: string;
  rows: ConfirmRow[];
  /** Shown as a summary strip at the top, e.g. "2 item(s) · 14 pcs". */
  totals?: string[];
  reason?: string;
  remarks?: string;
  warnings?: string[];
  /** A plain line above the buttons (used by Cancel Entry). */
  note?: string;
  confirmLabel?: string;
  editLabel?: string;
  destructive?: boolean;
  /** Sends the call. The screen closes the sheet when the reply comes. */
  onConfirm: () => Promise<unknown> | unknown;
};

type Props = {
  spec: ConfirmSpec | null;
  onEdit: () => void;
};

const CELL = 58;
const WIDE_CELL = 82;

// "Check before saving": shown before every save on the stock screens and
// on the Sales Order screen, so a 100 typed for 10 is caught before it's sent.
// Laid out as a table — one line per item, figures in columns — so a long
// list can be checked at a glance.
const ConfirmSaveSheet = ({spec, onEdit}: Props) => {
  const [busy, setBusy] = useState(false);
  // A ref as well as state: two taps in the same frame both see busy=false.
  const sending = useRef(false);

  useEffect(() => {
    if (!spec) {
      sending.current = false;
      setBusy(false);
    }
  }, [spec]);

  const confirm = async () => {
    if (!spec || sending.current) {
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      await spec.onConfirm();
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  const close = () => {
    if (!sending.current) {
      onEdit();
    }
  };

  const columns = spec?.rows[0]?.figures ?? [];
  const warnings = spec?.warnings ?? [];
  // A row is flagged when a warning names its item.
  const flagged = (row: ConfirmRow) => warnings.some(w => w.includes(row.name));
  const cellWidth = (fig?: ConfirmFigure) => (fig?.wide ? WIDE_CELL : CELL);

  return (
    <Modal
      visible={!!spec}
      transparent
      animationType="slide"
      onRequestClose={close}>
      <View style={styles.overlay}>
        {spec ? (
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>
              {spec.title ?? 'Check before saving'}
            </Text>
            <Text style={styles.header}>{spec.header}</Text>
            {spec.subheader ? (
              <Text style={styles.subheader}>{spec.subheader}</Text>
            ) : null}

            {spec.totals?.length ? (
              <View style={styles.summary}>
                {spec.totals.map((t, i) => (
                  <Text
                    key={t}
                    style={[styles.summaryText, i === 0 && styles.summaryMain]}>
                    {t}
                  </Text>
                ))}
              </View>
            ) : null}

            <View style={styles.table}>
              <View style={styles.tableHead}>
                <Text style={[styles.headText, styles.nameCol]}>
                  Item ({spec.rows.length})
                </Text>
                {columns.map((fig, i) => (
                  <Text
                    key={i}
                    numberOfLines={2}
                    style={[
                      styles.headText,
                      styles.numHead,
                      {width: cellWidth(fig)},
                    ]}>
                    {fig.label ?? 'Qty'}
                  </Text>
                ))}
              </View>
              <ScrollView style={styles.rows}>
                {spec.rows.map((row, index) => {
                  const warn = flagged(row);
                  return (
                    <View
                      key={row.key}
                      style={[
                        styles.row,
                        index % 2 === 1 && styles.rowAlt,
                        warn && styles.rowWarn,
                      ]}>
                      <View style={styles.nameCol}>
                        <View style={styles.nameLine}>
                          {warn ? (
                            <Ionicons
                              name="alert-circle"
                              size={13}
                              color="#B45309"
                              style={styles.warnIcon}
                            />
                          ) : null}
                          <Text
                            style={[
                              styles.rowName,
                              row.removed && styles.struck,
                            ]}
                            numberOfLines={2}>
                            {row.name}
                          </Text>
                        </View>
                        {row.removed ? (
                          <Text style={styles.rowLine}>Taken off</Text>
                        ) : null}
                        {row.lines?.map(line => (
                          <Text key={line} style={styles.rowLine}>
                            {line}
                          </Text>
                        ))}
                      </View>
                      {row.figures.map((fig, i) => {
                        const changed =
                          fig.old !== undefined &&
                          String(fig.old) !== String(fig.value);
                        return (
                          <View
                            key={i}
                            style={[styles.cell, {width: cellWidth(fig)}]}>
                            {changed ? (
                              <Text style={styles.oldValue}>{fig.old} →</Text>
                            ) : null}
                            <Text
                              style={[
                                styles.value,
                                fig.wide && styles.valueWide,
                                changed && styles.changedValue,
                                warn && styles.warnValue,
                                row.removed && styles.struck,
                              ]}>
                              {fig.value}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {spec.reason || spec.remarks ? (
              <View style={styles.extras}>
                {spec.reason ? (
                  <Text style={styles.extra}>
                    <Text style={styles.extraLabel}>Reason: </Text>
                    {spec.reason}
                  </Text>
                ) : null}
                {spec.remarks ? (
                  <Text style={styles.extra}>
                    <Text style={styles.extraLabel}>Remarks: </Text>
                    {spec.remarks}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {warnings.length ? (
              <View style={styles.warningBox}>
                {warnings.map(w => (
                  <View key={w} style={styles.warningRow}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#B45309"
                    />
                    <Text style={styles.warningText}>{w}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {spec.note ? <Text style={styles.note}>{spec.note}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                disabled={busy}
                onPress={close}>
                <Text style={styles.editText}>{spec.editLabel ?? 'Edit'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  spec.destructive && styles.destructive,
                  busy && styles.disabled,
                ]}
                disabled={busy}
                onPress={confirm}>
                {busy ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.confirmText}>
                    {spec.confirmLabel ?? 'Confirm & Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  title: {fontFamily: Fonts.semiBold, color: Colors.darkButton, fontSize: 16},
  header: {
    fontFamily: Fonts.medium,
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  subheader: {
    fontFamily: Fonts.medium,
    color: '#2563EB',
    fontSize: 12,
    marginTop: 2,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  summaryText: {fontFamily: Fonts.semiBold, color: '#334155', fontSize: 12},
  summaryMain: {color: Colors.darkButton, fontSize: 13},
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 1,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headText: {
    fontFamily: Fonts.semiBold,
    color: '#64748B',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  numHead: {textAlign: 'right'},
  nameCol: {flex: 1, paddingRight: 8},
  rows: {flexGrow: 0},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowAlt: {backgroundColor: '#FCFCFD'},
  rowWarn: {backgroundColor: '#FFFBEB'},
  nameLine: {flexDirection: 'row', alignItems: 'flex-start'},
  warnIcon: {marginRight: 4, marginTop: 1},
  rowName: {
    flex: 1,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    fontSize: 11,
    lineHeight: 15,
  },
  rowLine: {
    fontFamily: Fonts.regular,
    color: Colors.gray,
    fontSize: 10,
    marginTop: 1,
  },
  cell: {alignItems: 'flex-end', justifyContent: 'center'},
  oldValue: {
    fontFamily: Fonts.medium,
    color: Colors.gray,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  value: {fontFamily: Fonts.bold, color: '#111827', fontSize: 16},
  valueWide: {fontSize: 13, fontFamily: Fonts.semiBold},
  changedValue: {color: '#1D4ED8'},
  warnValue: {color: '#B45309'},
  struck: {textDecorationLine: 'line-through', color: Colors.gray},
  extras: {marginTop: 8},
  extra: {fontFamily: Fonts.regular, color: '#334155', fontSize: 12},
  extraLabel: {fontFamily: Fonts.medium, color: Colors.gray},
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 4,
  },
  warningRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 6},
  warningText: {
    flex: 1,
    fontFamily: Fonts.medium,
    color: '#92400E',
    fontSize: 12,
  },
  note: {
    fontFamily: Fonts.medium,
    color: '#334155',
    fontSize: 12,
    marginTop: 10,
  },
  actions: {flexDirection: 'row', gap: 10, marginTop: 14},
  editButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  editText: {fontFamily: Fonts.medium, color: Colors.darkButton},
  confirmButton: {
    flex: 1.4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    backgroundColor: Colors.darkButton,
  },
  destructive: {backgroundColor: '#B91C1C'},
  confirmText: {fontFamily: Fonts.semiBold, color: Colors.white},
  disabled: {opacity: 0.6},
});

export default ConfirmSaveSheet;
