import React, { memo, useDeferredValue, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import ReusableDatePicker from '../../../components/ui-lib/reusable-date-picker';
import {
  ChipTabs,
  FilterPicker,
  getTone,
} from '../../../components/SO/Team/TeamFilters';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import {
  TeamReportColumn,
  TeamReportColumnType,
  TeamReportView,
} from '../../../types/baseType';
import {
  useGetTeamReportOptionsQuery,
  useGetTeamReportQuery,
} from '../../../features/base/promoter-base-api';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'TeamReportsScreen'>;
};

const VIEWS: { label: string; value: TeamReportView }[] = [
  { label: 'Sales', value: 'sales' },
  { label: 'Counts', value: 'counts' },
  { label: 'Deliveries', value: 'deliveries' },
  { label: 'Stock', value: 'stock' },
  { label: 'Compliance', value: 'compliance' },
  { label: 'Orders', value: 'orders' },
];

// First mode of each list is the server default
const MODES: Partial<Record<TeamReportView, { label: string; value: string }[]>> = {
  sales: [
    { label: 'Promoter', value: 'promoter' },
    { label: 'Store', value: 'store' },
    { label: 'Item', value: 'item' },
    { label: 'SKU', value: 'sku' },
    { label: 'Day', value: 'day' },
    { label: 'Day × SKU', value: 'day_sku' },
  ],
  stock: [
    { label: 'Store', value: 'store' },
    { label: 'SKU', value: 'sku' },
    { label: 'Closing day-wise', value: 'closing_day' },
  ],
};

// Day modes give one column per day; the server allows at most 31
const DAY_MODES = ['day', 'day_sku'];
const MAX_DAY_MODE_DAYS = 31;
// Rows rendered at a time; day modes can have 30+ columns per row.
const ROW_STEP = 50;

const COL_WIDTH: Record<TeamReportColumnType, number> = {
  text: 150,
  date: 90,
  qty: 70,
  money: 90,
  pct: 64,
  badge: 110,
};

const isNumeric = (t: TeamReportColumnType) =>
  t === 'qty' || t === 'money' || t === 'pct';

// Built once: toLocaleString with options builds a new formatter on every
// call, which is slow across thousands of table cells.
const QTY_FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const MONEY_FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
const PCT_FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

const formatValue = (value: any, type?: TeamReportColumnType): string => {
  if (value === null || value === undefined || value === '') {
    return '–';
  }
  switch (type) {
    case 'qty':
      return QTY_FORMAT.format(Math.round(Number(value)));
    case 'money':
      return `₹${MONEY_FORMAT.format(Number(value))}`;
    case 'pct':
      return `${PCT_FORMAT.format(Number(value))}%`;
    case 'date': {
      const m = moment(value);
      return m.isValid() ? m.format('DD MMM YY') : String(value);
    }
    default:
      return String(value);
  }
};

const renderCell = (col: TeamReportColumn, value: any) => {
  const width = COL_WIDTH[col.type] ?? COL_WIDTH.text;
  if (col.type === 'badge' && value) {
    const tone = getTone(col.tones?.[value]);
    return (
      <View key={col.key} style={[styles.cell, { width }]}>
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.badgeText, { color: tone.color }]} numberOfLines={1}>
            {String(value)}
          </Text>
        </View>
      </View>
    );
  }
  // One Text per plain cell (not View > Text): a day-mode report has
  // thousands of cells.
  return (
    <Text
      key={col.key}
      style={[
        styles.cell,
        styles.cellText,
        { width },
        isNumeric(col.type) && styles.cellNum,
      ]}
      numberOfLines={2}>
      {formatValue(value, col.type)}
    </Text>
  );
};

const ReportRow = memo(
  ({
    row,
    columns,
    alt,
  }: {
    row: Record<string, any>;
    columns: TeamReportColumn[];
    alt: boolean;
  }) => (
    <View style={[styles.tableRow, alt && styles.tableRowAlt]}>
      {columns.map(col => renderCell(col, row[col.key]))}
    </View>
  ),
);

// Re-renders only when the report or the row count changes, not on every
// screen update (refresh spinner, filters opening).
const ReportTable = memo(
  ({
    columns,
    rows,
    visibleRows,
    onShowMore,
  }: {
    columns: TeamReportColumn[];
    rows: Record<string, any>[];
    visibleRows: number;
    onShowMore: () => void;
  }) => (
    <View style={[styles.card, boxShadow, styles.tableCard]}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map(col => (
              <View
                key={col.key}
                style={[styles.cell, { width: COL_WIDTH[col.type] ?? COL_WIDTH.text }]}>
                <Text
                  style={[styles.headerText, isNumeric(col.type) && styles.cellNum]}
                  numberOfLines={2}>
                  {col.label}
                </Text>
              </View>
            ))}
          </View>
          {rows.slice(0, visibleRows).map((row, i) => (
            <ReportRow key={i} row={row} columns={columns} alt={i % 2 === 1} />
          ))}
        </View>
      </ScrollView>
      {rows.length > visibleRows && (
        <TouchableOpacity style={styles.moreBtn} onPress={onShowMore}>
          <Text style={styles.moreText}>
            Show more ({rows.length - visibleRows} left)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ),
);

const showMoreRows = (v: number) => v + ROW_STEP;

const TeamReportsScreen = ({ navigation }: Props) => {
  const [view, setView] = useState<TeamReportView>('sales');
  const [mode, setMode] = useState('promoter');
  const [fromDate, setFromDate] = useState(
    moment().startOf('month').format('YYYY-MM-DD'),
  );
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [zone, setZone] = useState('');
  const [promoter, setPromoter] = useState('');
  const [store, setStore] = useState('');
  const [visibleRows, setVisibleRows] = useState(ROW_STEP);

  const modes = MODES[view];
  const rangeDays = moment(toDate).diff(moment(fromDate), 'days') + 1;
  const rangeError =
    rangeDays < 1
      ? 'To date cannot be before from date.'
      : DAY_MODES.includes(mode) && modes && rangeDays > MAX_DAY_MODE_DAYS
      ? `Day-wise sales can cover at most ${MAX_DAY_MODE_DAYS} days. Shorten the date range.`
      : '';

  const { data: optionsData } = useGetTeamReportOptionsQuery();
  // currentData: never show the previous view's columns while the next loads
  const { currentData, isFetching, isLoading, error, refetch } = useGetTeamReportQuery(
    {
      view,
      from_date: fromDate,
      to_date: toDate,
      zone: zone || undefined,
      promoter: promoter || undefined,
      store: store || undefined,
      mode: modes ? mode : undefined,
    },
    { skip: !!rangeError },
  );

  const zoneOptions = useMemo(
    () => (optionsData?.message?.zones ?? []).map(z => ({ label: z, value: z })),
    [optionsData],
  );
  const promoterOptions = useMemo(
    () =>
      (optionsData?.message?.promoters ?? [])
        .filter(p => !zone || p.zone === zone)
        .map(p => ({ label: p.label, value: p.name })),
    [optionsData, zone],
  );
  const storeOptions = useMemo(
    () =>
      (optionsData?.message?.stores ?? []).map(s => ({
        label: s.label,
        value: s.name,
      })),
    [optionsData],
  );

  const report = currentData?.message;
  const columns = useMemo(() => report?.columns ?? [], [report]);
  const rows = useMemo(() => report?.rows ?? [], [report]);
  const kpis = report?.kpis ?? [];
  // "Show more" responds at once; the extra rows render after it.
  const deferredVisibleRows = useDeferredValue(visibleRows);
  const onShowMore = useMemo(() => () => setVisibleRows(showMoreRows), []);

  const changeView = (v: TeamReportView) => {
    setView(v);
    setMode(MODES[v]?.[0]?.value ?? '');
    setVisibleRows(ROW_STEP);
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Team Reports" navigation={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => !rangeError && refetch()}
          />
        }>
        <ChipTabs options={VIEWS} value={view} onChange={changeView} />
        {modes && (
          <ChipTabs
            options={modes}
            value={mode}
            onChange={m => {
              setMode(m);
              setVisibleRows(ROW_STEP);
            }}
          />
        )}

        <View style={styles.filterRow}>
          <View style={{ flex: 1 }}>
            <ReusableDatePicker
              label="From"
              value={fromDate}
              onChange={setFromDate}
              height={38}
              textSize={Size.xxs}
              marginBottom={0}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ReusableDatePicker
              label="To"
              value={toDate}
              onChange={setToDate}
              height={38}
              textSize={Size.xxs}
              marginBottom={0}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <FilterPicker
            icon="map-outline"
            placeholder="All zones"
            value={zone}
            options={zoneOptions}
            onChange={v => {
              setZone(v);
              setPromoter('');
            }}
          />
          <FilterPicker
            icon="person-outline"
            placeholder="All promoters"
            value={promoter}
            options={promoterOptions}
            onChange={setPromoter}
          />
        </View>
        <View style={styles.filterRow}>
          <FilterPicker
            icon="storefront-outline"
            placeholder="All stores"
            value={store}
            options={storeOptions}
            onChange={setStore}
          />
        </View>

        {rangeError ? (
          <View style={styles.empty}>
            <Text style={styles.warnText}>{rangeError}</Text>
          </View>
        ) : isLoading || (isFetching && !report) ? (
          <ActivityIndicator size="large" color={Colors.orange} style={styles.loading} />
        ) : error ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>Could not load report.</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retry}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {kpis.length > 0 && (
              <View style={styles.kpiGrid}>
                {kpis.map(k => {
                  const tone = getTone(k.tone);
                  return (
                    <View
                      key={k.label}
                      style={[styles.kpi, boxShadow, { borderLeftColor: tone.color }]}>
                      <Text style={[styles.kpiValue, { color: tone.color }]}>
                        {formatValue(k.value, k.type)}
                      </Text>
                      <Text style={styles.kpiLabel} numberOfLines={2}>
                        {k.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {rows.length > 0 ? (
              <ReportTable
                columns={columns}
                rows={rows}
                visibleRows={deferredVisibleRows}
                onShowMore={onShowMore}
              />
            ) : (
              <View style={styles.empty}>
                <Text style={styles.muted}>No data for these filters.</Text>
              </View>
            )}

            {report?.note ? <Text style={styles.note}>{report.note}</Text> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeamReportsScreen;

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  filterRow: { flexDirection: 'row', gap: 8 },
  loading: { marginTop: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpi: {
    flexGrow: 1,
    minWidth: '30%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  kpiValue: { fontFamily: Fonts.semiBold, fontSize: Size.sm },
  kpiLabel: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  tableCard: { paddingVertical: 4, overflow: 'hidden' },
  tableRow: { flexDirection: 'row' },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    // For cells that are a single Text: fill the row height, text centred.
    alignSelf: 'stretch',
    textAlignVertical: 'center',
  },
  headerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.darkButton,
  },
  cellText: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.darkButton,
  },
  cellNum: { textAlign: 'right' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontFamily: Fonts.medium, fontSize: 10 },
  moreBtn: { alignItems: 'center', paddingVertical: 10 },
  moreText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.orange,
  },
  note: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
  muted: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  warnText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#B45309',
    textAlign: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  retry: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.orange,
  },
});
