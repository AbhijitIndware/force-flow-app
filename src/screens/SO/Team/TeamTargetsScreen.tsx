import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import PageHeader from '../../../components/ui/PageHeader';
import {
  ChipTabs,
  MonthSwitcher,
  ProgressBar,
  SearchInput,
  useDebounce,
} from '../../../components/SO/Team/TeamFilters';
import { flexCol, boxShadow } from '../../../utils/styles';
import { Colors } from '../../../utils/colors';
import { Fonts } from '../../../constants';
import { Size } from '../../../utils/fontSize';
import { SoAppStackParamList } from '../../../types/Navigation';
import { TeamTargetRow, TeamTargetsShow } from '../../../types/baseType';
import { useGetTeamTargetsQuery } from '../../../features/base/promoter-base-api';

type Props = {
  navigation: NativeStackNavigationProp<SoAppStackParamList, 'TeamTargetsScreen'>;
};

const PAGE_SIZE = 20;

const fmtQty = (n?: number) => Math.round(Number(n || 0)).toLocaleString('en-IN');
const fmtPct = (n?: number) => `${Math.round(Number(n || 0))}%`;

const TeamTargetsScreen = ({ navigation }: Props) => {
  const [month, setMonth] = useState(moment().startOf('month'));
  const [search, setSearch] = useState('');
  const [show, setShow] = useState<TeamTargetsShow | 'all'>('all');
  const [rows, setRows] = useState<TeamTargetRow[]>([]);
  const [showFocusItems, setShowFocusItems] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const monthParam = month.format('YYYY-MM-DD');

  // Page belongs to one set of filters; any filter change starts at page 1
  const filterKey = `${monthParam}|${debouncedSearch}|${show}`;
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const page = paging.key === filterKey ? paging.page : 1;
  const setPage = (next: number) => setPaging({ key: filterKey, page: next });

  const { data, isFetching, isLoading, error, refetch } = useGetTeamTargetsQuery({
    month: monthParam,
    search: debouncedSearch || undefined,
    show: show === 'all' ? undefined : show,
    page,
    page_size: PAGE_SIZE,
  });

  const result = data?.message?.data;
  const totals = result?.totals;
  const total = result?.total ?? 0;
  const focusItems = result?.focus_items ?? [];

  useEffect(() => {
    if (!result) {
      return;
    }
    const newRows = result.rows ?? [];
    setRows(prev => (result.page > 1 ? [...prev, ...newRows] : newRows));
  }, [result]);

  const hasMore = rows.length < total;

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(page + 1);
    }
  };

  const showOptions: { label: string; value: TeamTargetsShow | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: `Behind (${totals?.behind ?? 0})`, value: 'behind' },
    { label: `Done (${totals?.done ?? 0})`, value: 'done' },
    { label: `No target (${totals?.missing ?? 0})`, value: 'missing' },
  ];

  const renderTotals = () => (
    <View style={[styles.card, boxShadow]}>
      <View style={styles.totalsTop}>
        <Text style={styles.cardTitle}>Team total</Text>
        <Text style={styles.muted}>{totals?.promoters ?? 0} promoters</Text>
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Target</Text>
          <Text style={styles.progressValue}>
            {fmtQty(totals?.net_sold)} / {fmtQty(totals?.target)} pcs ·{' '}
            {fmtPct(totals?.achieved_pct)}
          </Text>
        </View>
        <ProgressBar pct={totals?.achieved_pct ?? 0} />
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Focus</Text>
          <Text style={styles.progressValue}>
            {fmtQty(totals?.focus_net_sold)} / {fmtQty(totals?.focus_target)} pcs ·{' '}
            {fmtPct(totals?.focus_pct)}
          </Text>
        </View>
        <ProgressBar pct={totals?.focus_pct ?? 0} />
      </View>

      {focusItems.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.focusToggle}
            onPress={() => setShowFocusItems(v => !v)}>
            <Text style={styles.focusToggleText}>
              Focus items ({focusItems.length})
            </Text>
            <Ionicons
              name={showFocusItems ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.orange}
            />
          </TouchableOpacity>
          {showFocusItems &&
            focusItems.map(f => (
              <View key={`${f.item}-${f.state ?? ''}`} style={styles.focusRow}>
                <Text style={styles.focusName}>{f.item_name}</Text>
                {f.state ? (
                  <Text style={styles.focusState}>only {f.state}</Text>
                ) : null}
              </View>
            ))}
        </>
      )}
    </View>
  );

  const renderRow = ({ item }: { item: TeamTargetRow }) => {
    if (item.missing) {
      return (
        <View style={[styles.card, styles.rowCard, boxShadow]}>
          <Text style={styles.name}>{item.employee_name}</Text>
          <Text style={styles.muted}>Emp No. {item.employee_number}</Text>
          <Text style={styles.missingText}>No target set for this month</Text>
        </View>
      );
    }
    return (
      <View style={[styles.card, styles.rowCard, boxShadow]}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.employee_name}</Text>
            <Text style={styles.muted}>
              Emp No. {item.employee_number}
              {item.state ? ` · ${item.state}` : ''}
            </Text>
            {item.store_name ? (
              <Text style={styles.muted}>{item.store_name}</Text>
            ) : null}
          </View>
          <Text style={styles.bigPct}>{fmtPct(item.achieved_pct)}</Text>
        </View>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Target</Text>
            <Text style={styles.progressValue}>
              {fmtQty(item.net_sold)} / {fmtQty(item.target_qty)} pcs
            </Text>
          </View>
          <ProgressBar pct={item.achieved_pct ?? 0} />
        </View>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Focus</Text>
            <Text style={styles.progressValue}>
              {fmtQty(item.focus_net_sold)} / {fmtQty(item.focus_target_qty)} pcs ·{' '}
              {fmtPct(item.focus_pct)}
            </Text>
          </View>
          <ProgressBar pct={item.focus_pct ?? 0} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[flexCol, { flex: 1, backgroundColor: Colors.lightBg }]}>
      <PageHeader title="Team Targets" navigation={() => navigation.goBack()} />

      <View style={styles.filters}>
        <MonthSwitcher month={month} onChange={setMonth} />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Name, Employee No. or store"
        />
        <ChipTabs options={showOptions} value={show} onChange={setShow} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.orange} style={styles.loading} />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.muted}>Could not load targets.</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retry}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r, i) => `${r.employee}-${i}`}
          renderItem={renderRow}
          ListHeaderComponent={show === 'missing' ? null : renderTotals()}
          ListEmptyComponent={
            isFetching ? null : (
              <View style={styles.empty}>
                <Text style={styles.muted}>No promoters match.</Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetching && page > 1 ? (
              <ActivityIndicator color={Colors.orange} style={{ marginVertical: 12 }} />
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1 && !isLoading}
              onRefresh={() => (page === 1 ? refetch() : setPage(1))}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TeamTargetsScreen;

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  list: { padding: 16, paddingBottom: 40 },
  loading: { marginTop: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  rowCard: { gap: 2 },
  totalsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.darkButton,
  },
  muted: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  progressBlock: { marginTop: 10, gap: 5 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  progressValue: {
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.textSecondary,
  },
  focusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  focusToggleText: {
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: Colors.orange,
  },
  focusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 8,
  },
  focusName: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xxs,
    color: Colors.darkButton,
  },
  focusState: {
    fontFamily: Fonts.medium,
    fontSize: 10,
    color: '#7C3AED',
  },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  name: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.darkButton,
  },
  bigPct: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.sm,
    color: Colors.orange,
  },
  missingText: {
    marginTop: 6,
    fontFamily: Fonts.medium,
    fontSize: Size.xxs,
    color: '#B91C1C',
  },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  retry: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.xs,
    color: Colors.orange,
  },
});
