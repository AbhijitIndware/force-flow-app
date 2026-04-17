/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import {
  Users,
  TrendingUp,
  ShoppingCart,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  IndianRupee,
  UserCheck,
  UserX,
  Store,
  BarChart2,
  Calendar,
  ChevronDown,
  X,
  LucideIcon,
  Building2,
  ChevronRight,
} from 'lucide-react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useGetAsmDashboardQuery } from '../../../features/base/base-api';
import { useAppSelector } from '../../../store/hook';
import AsmStoreTypeComponent from '../../../components/SO/Sales/AsmStoreTypeComponent';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { label: 'Last week', value: 'A' },
  { label: 'Last month', value: 'B' },
  { label: 'Last three months', value: 'C' },
];

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: '#F0F2F6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#FFFAE4',
  accent: '#FFB302',
  accentSoft: '#FFF8E1',
  green: '#0AB72A',
  greenSoft: '#E7F8EA',
  amber: '#FF7B00',
  amberSoft: '#FFE9D4',
  red: '#D31010',
  redSoft: '#FBE8E8',
  purple: '#367CFF',
  purpleSoft: '#E3ECFF',
  yellow: '#FFB302',
  yellowSoft: '#FFFAE4',
  text: '#1A1A1A',
  textSub: '#4F4F4F',
  textMuted: '#828282',
  border: '#E0E0E0',
  shadow: 'rgba(0,0,0,0.06)',
} as const;

// ─── Date Helpers ─────────────────────────────────────────────────────────────
/** Date → 'YYYY-MM-DD' for API */
const toApiDate = (d: Date): string => d.toISOString().split('T')[0];

/** Date → '19 Mar 2026' for display */
const toDisplayDate = (d: Date): string =>
  d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ─── API Types ────────────────────────────────────────────────────────────────
export interface AsmOverview {
  employee_id: string;
  employee_name: string;
  designation: string;
  attendance_status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  team_size: number;
  so_count: number;
  isr_count: number;
  outlets_planned: number;
  outlets_visited: number;
  outlets_completed: number;
  outlets_pending: number;
  completion_rate: number;
  orders_today: number;
  order_value: number;
  orders_delivered: number;
  orders_pending: number;
  delivery_rate: number;
}

export interface AsmKeyMetrics {
  team_size: number;
  team_present: number;
  team_absent: number;
  attendance_rate: number;
  outlets_planned: number;
  outlets_visited: number;
  outlets_pending: number;
  visit_rate: number;
  orders_today: number;
  order_value: number;
  orders_delivered: number;
  delivery_rate: number;
  store_created_success: number;
  store_created: number
}

export interface AsmStorePlanning {
  planned: number;
  visited: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

export interface AsmBusinessGenerated {
  total_orders: number;
  draft_orders: number;
  order_value: number;
  orders_delivered: number;
  orders_pending: number;
  delivery_rate: number;
  avg_order_value: number;
}

export interface AsmOrderStatus {
  order_id: string;
  time: string;
  salesperson: string;
  store: string;
  order_value: number;
  items: number;
  status: string;
  workflow_state: string;
  docstatus: number;
  payment: string;
  delivery_status: string;
  delivery_display_status: string;
}

export interface AsmTeamMember {
  employee_id: string;
  employee_name: string;
  initials: string;
  role: 'SO' | 'ISR';
  designation: string;
  reports_to: string;
  attendance_status: 'Present' | 'Absent';
  check_in_time: string | null;
  check_out_time: string | null;
  outlets_planned: number;
  outlets_visited: number;
  outlets_completed: number;
  outlets_pending: number;
  completion_rate: number;
  orders: number;
  order_value: number;
  orders_delivered: number;
  orders_pending: number;
  avg_order_size?: number;
  conversion_rate?: number;
}

export interface AsmDashboardMessage {
  success: boolean;
  date: string;
  formatted_date: string;
  current_time: string;
  role_code: string;
  asm_overview: AsmOverview;
  key_metrics: AsmKeyMetrics;
  store_planning: AsmStorePlanning;
  business_generated: AsmBusinessGenerated;
  order_status: AsmOrderStatus[];
  team_performance: AsmTeamMember[];
}

export interface AsmDashboardResponse {
  message: AsmDashboardMessage;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n?: number): string => {
  if (n === undefined || n === null) return '₹0';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

// ─── Sub-component prop types ─────────────────────────────────────────────────
interface AvatarBadgeProps {
  initials: string;
  present: boolean;
  size?: number;
}
interface StatPillProps {
  label: string;
  value: number | string;
  color?: string;
  bgColor?: string;
}
interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  accent?: string;
}
interface ProgressBarProps {
  value: number;
  color?: string;
}
interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bgColor: string;
  wide?: boolean;
}
interface OrderCardProps {
  order: AsmOrderStatus;
  index: number;
}
interface TeamMemberCardProps {
  member: AsmTeamMember;
}
interface DateSelectorBarProps {
  label: string;
  onPress: () => void;
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  initials,
  present,
  size = 38,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: present ? C.accentSoft : C.redSoft,
      borderWidth: 1.5,
      borderColor: present ? C.accent : C.red,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text
      style={{
        color: present ? C.amber : C.red,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
      }}>
      {initials}
    </Text>
  </View>
);

const StatPill: React.FC<StatPillProps> = ({
  label,
  value,
  color = C.accent,
  bgColor,
}) => (
  <View
    style={{
      backgroundColor: bgColor ?? `${color}20`,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${color}30`,
    }}>
    <Text style={{ color, fontSize: 14, fontWeight: '800' }}>{value}</Text>
    <Text
      style={{
        color: C.textMuted,
        fontSize: 9,
        marginTop: 2,
        letterSpacing: 0.4,
        fontWeight: '500',
      }}>
      {label}
    </Text>
  </View>
);

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  accent = C.accent,
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIcon, { backgroundColor: `${accent}20` }]}>
      <Icon size={14} color={accent} strokeWidth={2.2} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ value, color = C.accent }) => (
  <View style={styles.progressTrack}>
    <View
      style={[
        styles.progressFill,
        {
          width: `${Math.min(value, 100)}%` as `${number}%`,
          backgroundColor: color,
        },
      ]}
    />
  </View>
);

// ─── Date Selector Bar ────────────────────────────────────────────────────────
const DateSelectorBar: React.FC<DateSelectorBarProps> = ({ label, onPress }) => (
  <TouchableOpacity
    style={styles.dateBar}
    onPress={onPress}
    activeOpacity={0.75}>
    <View style={styles.dateBarLeft}>
      <View style={styles.dateBarIcon}>
        <Calendar size={15} color={C.amber} strokeWidth={2} />
      </View>
      <View>
        <Text style={styles.dateBarHint}>Dashboard Date</Text>
        <Text style={styles.dateBarLabel}>{label}</Text>
      </View>
    </View>
    <View style={styles.dateBarChevron}>
      <ChevronDown size={16} color={C.amber} strokeWidth={2.5} />
    </View>
  </TouchableOpacity>
);

// ─── Dashboard Header ─────────────────────────────────────────────────────────
interface DashboardHeaderProps {
  formattedDate: string;
  overview: AsmOverview;
  company_emp_id: string
}
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  formattedDate,
  overview,
  company_emp_id
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerAccentBar} />
      <View style={styles.headerInner}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.headerDate}>{formattedDate}</Text>
          <Text style={styles.headerName} numberOfLines={2}>
            {overview.employee_name}
          </Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerDesig}>{overview.designation}</Text>
            <View
              style={[
                styles.attendanceBadge,
                {
                  backgroundColor:
                    overview.attendance_status === 'Present'
                      ? C.greenSoft
                      : C.redSoft,
                  borderColor:
                    overview.attendance_status === 'Present'
                      ? `${C.green}30`
                      : `${C.red}30`,
                },
              ]}>
              <Text
                style={[
                  styles.attendanceBadgeText,
                  {
                    color:
                      overview.attendance_status === 'Present'
                        ? C.green
                        : C.red,
                  },
                ]}>
                {overview.attendance_status}
              </Text>
            </View>
            {overview.check_in_time && (
              <Text style={styles.checkInText}>
                In: {overview.check_in_time}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.headerIdBox}>
          <Text style={styles.headerIdLabel}>EMP NO</Text>
          <Text style={styles.headerIdVal}>{company_emp_id}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── KPI Grid ─────────────────────────────────────────────────────────────────
const KpiCard: React.FC<KpiCardProps> = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
  wide,
}) => (
  <View style={[styles.kpiCard, wide === true && { width: '100%' }]}>
    <View style={[styles.kpiIconWrap, { backgroundColor: bgColor }]}>
      <Icon size={18} color={color} strokeWidth={2} />
    </View>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
    {sub != null && <Text style={styles.kpiSub}>{sub}</Text>}
  </View>
);

interface KpiGridProps {
  metrics: AsmKeyMetrics;
}
const KpiGrid: React.FC<KpiGridProps> = ({ metrics: m }) => (
  <View>
    <SectionHeader icon={BarChart2} title="Today's Overview" accent={C.amber} />
    <View style={styles.kpiRow}>
      <KpiCard
        icon={Users}
        label="Team Present"
        value={`${m.team_present}/${m.team_size}`}
        sub={`${m.attendance_rate}% rate`}
        color={C.amber}
        bgColor={C.amberSoft}
      />
      <KpiCard
        icon={MapPin}
        label="Outlets Visited"
        value={`${m.outlets_visited}`}
        sub={`${m.visit_rate}% of ${m.outlets_planned} planned`}
        color={C.green}
        bgColor={C.greenSoft}
      />
      <KpiCard
        icon={ShoppingCart}
        label="Orders"
        value={m.orders_today}
        sub={`${m.outlets_pending} pending`}
        color={C.accent}
        bgColor={C.accentSoft}
      />
      <KpiCard
        icon={IndianRupee}
        label="Order Value"
        value={`₹${m.order_value}`}
        sub={`${m.orders_delivered} delivered`}
        color={C.purple}
        bgColor={C.purpleSoft}
      />
      <KpiCard
        icon={Building2}
        label="Store Created"
        value={`${m.store_created}`}
        sub={`${m.store_created} Successfully`}
        color={C.purple}
        bgColor={C.purpleSoft}
      />
    </View>
  </View>
);

// ─── Store Planning ───────────────────────────────────────────────────────────
interface StorePlanningProps {
  planning: AsmStorePlanning;
}
const StorePlanning: React.FC<StorePlanningProps> = ({ planning: p }) => (
  <View style={styles.planCard}>
    <SectionHeader icon={Store} title="Store Planning" accent={C.green} />
    <View style={styles.planRow}>
      <StatPill
        label="Planned"
        value={p.planned}
        color={C.textSub}
        bgColor="#F2F2F2"
      />
      <StatPill
        label="Visited"
        value={p.visited}
        color={C.purple}
        bgColor={C.purpleSoft}
      />
      {/* <StatPill
        label="Completed"
        value={p.completed}
        color={C.green}
        bgColor={C.greenSoft}
      /> */}
      <StatPill
        label="Pending"
        value={p.pending}
        color={C.textMuted}
        bgColor="#F2F2F2"
      />
    </View>
    <View style={{ marginTop: 14 }}>
      <View style={styles.planLabelRow}>
        <Text style={styles.planLabel}>Completion Rate</Text>
        <Text style={[styles.planLabel, { color: C.green, fontWeight: '700' }]}>
          {(p.completion_rate ?? 0).toFixed(0)}%
        </Text>
      </View>
      <ProgressBar value={p.completion_rate ?? 0} color={C.green} />
    </View>
  </View>
);

// ─── Business Summary ─────────────────────────────────────────────────────────
interface BusinessSummaryProps {
  business: AsmBusinessGenerated;
}
const BusinessSummary: React.FC<BusinessSummaryProps> = ({ business: b }) => (
  <View style={styles.bizCard}>
    <SectionHeader
      icon={TrendingUp}
      title="Business Generated"
      accent={C.accent}
    />
    <View style={styles.bizGrid}>
      <View style={styles.bizItem}>
        <Text style={[styles.bizVal, { color: C.amber }]}>{b.total_orders}</Text>
        <Text style={styles.bizLabel}>Total Orders</Text>
      </View>
      <View style={styles.bizDivider} />
      <View style={styles.bizItem}>
        <Text style={[styles.bizVal, { color: C.green }]}>
          {fmt(b.order_value)}
        </Text>
        <Text style={styles.bizLabel}>Order Value</Text>
      </View>
      <View style={styles.bizDivider} />
      <View style={styles.bizItem}>
        <Text style={[styles.bizVal, { color: C.purple }]}>
          {fmt(b.avg_order_value)}
        </Text>
        <Text style={styles.bizLabel}>Avg Order</Text>
      </View>
    </View>
    {/* <View style={styles.deliveryRow}>
      <Truck size={14} color={C.red} strokeWidth={2} />
      <Text style={styles.deliveryText}>
        Delivery:{' '}
        <Text style={{ color: C.red, fontWeight: '700' }}>
          {b.orders_pending} pending
        </Text>{' '}
        · {b.orders_delivered} delivered
      </Text>
    </View> */}
  </View>
);

// ─── Orders ───────────────────────────────────────────────────────────────────
interface OrderCardProps {
  order: AsmOrderStatus;
  index: number;
  navigation: any
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, index, navigation }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => navigation?.navigate('OrderDetailScreen', { order_id: order.order_id })}
    style={[styles.orderCard, index > 0 && { marginTop: 6 }]}>
    {/* Left accent stripe */}
    <View
      style={[
        styles.orderStripe,
        {
          backgroundColor:
            order.delivery_display_status === 'Pending' ? C.amber : C.green,
        },
      ]}
    />
    {/* Content */}
    <View style={styles.orderBody}>
      {/* Order ID + status badge */}
      <View style={styles.orderTopRow}>
        <Text style={styles.orderId}>{order.order_id}</Text>
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor:
                order.workflow_state === 'Pending'
                  ? C.amberSoft
                  : C.greenSoft,
            },
          ]}>
          <Text
            style={[
              styles.statusTagText,
              {
                color:
                  order.workflow_state === 'Pending'
                    ? C.amber
                    : C.green,
              },
            ]}>
            {order.workflow_state}
          </Text>
        </View>
      </View>

      {/* Store + value + time in one row */}
      <View style={styles.orderBottomRow}>
        <Text style={styles.orderStore} numberOfLines={1}>
          {order.store}
        </Text>
        <Text style={styles.orderValue}>{fmt(order.order_value)}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

interface OrdersSectionProps {
  orders: AsmOrderStatus[];
  navigation: any;
  date: any
}
// OrdersSection.tsx
const OrdersSection: React.FC<OrdersSectionProps> = ({ orders, date, navigation }) => {
  const preview = orders.slice(0, 3);
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );

  return (
    <View>
      <SectionHeader icon={ShoppingCart} title="Today's Orders" accent={C.purple} />
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders today</Text>
      ) : (
        <>
          {preview.map((order, i) => (
            <OrderCard key={order.order_id} order={order} index={i} navigation={navigation} />
          ))}
          {orders.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() =>
                navigation.navigate('AllOrdersScreen', { date: date, employee: employee?.id })
              }>
              <Text style={styles.viewAllText}>
                View all {orders.length} orders
              </Text>
              <ChevronRight size={14} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

// ─── Team Performance ─────────────────────────────────────────────────────────
// const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
//   const present = member.attendance_status === 'Present';
//   const initials = member.initials || getInitials(member.employee_name);
//   return (
//     <View style={styles.teamCard}>
//       <View style={styles.teamCardLeft}>
//         <AvatarBadge initials={initials} present={present} />
//         <View style={{ marginLeft: 10, flex: 1 }}>
//           <View style={styles.teamNameRow}>
//             <Text style={styles.teamName} numberOfLines={1}>
//               {member.employee_name}
//             </Text>
//             <View
//               style={[
//                 styles.roleBadge,
//                 {
//                   backgroundColor:
//                     member.role === 'SO' ? C.purpleSoft : C.accentSoft,
//                 },
//               ]}>
//               <Text
//                 style={[
//                   styles.roleText,
//                   { color: member.role === 'SO' ? C.purple : C.amber },
//                 ]}>
//                 {member.role}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.teamStatusRow}>
//             {present ? (
//               <>
//                 <UserCheck size={11} color={C.green} strokeWidth={2} />
//                 <Text style={[styles.teamStatus, { color: C.green }]}>
//                   In · {member.check_in_time}
//                 </Text>
//               </>
//             ) : (
//               <>
//                 <UserX size={11} color={C.red} strokeWidth={2} />
//                 <Text style={[styles.teamStatus, { color: C.red }]}>Absent</Text>
//               </>
//             )}
//           </View>
//         </View>
//       </View>
//       <View style={styles.teamStats}>
//         <View style={styles.teamStatCol}>
//           <Text style={[styles.teamStatVal, { color: C.purple }]}>
//             {member.outlets_visited}
//           </Text>
//           <Text style={styles.teamStatLabel}>Visited</Text>
//         </View>
//         <View style={styles.teamStatDivider} />
//         <View style={styles.teamStatCol}>
//           <Text style={[styles.teamStatVal, { color: C.amber }]}>
//             {member.orders}
//           </Text>
//           <Text style={styles.teamStatLabel}>Orders</Text>
//         </View>
//         <View style={styles.teamStatDivider} />
//         <View style={styles.teamStatCol}>
//           <Text style={[styles.teamStatVal, { color: C.green }]}>
//             {member.order_value > 0
//               ? `₹${(member.order_value / 1000).toFixed(1)}K`
//               : '—'}
//           </Text>
//           <Text style={styles.teamStatLabel}>Value</Text>
//         </View>
//       </View>
//     </View>
//   );
// };

interface TeamMemberCardProps {
  member: AsmTeamMember;
  onPress: () => void; // ← new prop
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onPress }) => {
  const present = member.attendance_status === 'Present';
  const initials = member.initials || getInitials(member.employee_name);
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
      <View style={styles.teamCard}>
        <View style={styles.teamCardLeft}>
          <AvatarBadge initials={initials} present={present} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <View style={styles.teamNameRow}>
              <Text style={styles.teamName} numberOfLines={1}>
                {member.employee_name}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      member.role === 'SO' ? C.purpleSoft : C.accentSoft,
                  },
                ]}>
                <Text
                  style={[
                    styles.roleText,
                    { color: member.role === 'SO' ? C.purple : C.amber },
                  ]}>
                  {member.role}
                </Text>
              </View>
            </View>
            <View style={styles.teamStatusRow}>
              {present ? (
                <>
                  <UserCheck size={11} color={C.green} strokeWidth={2} />
                  <Text style={[styles.teamStatus, { color: C.green }]}>
                    In · {member.check_in_time}
                  </Text>
                </>
              ) : (
                <>
                  <UserX size={11} color={C.red} strokeWidth={2} />
                  <Text style={[styles.teamStatus, { color: C.red }]}>Absent</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.teamStats}>
          <View style={styles.teamStatCol}>
            <Text style={[styles.teamStatVal, { color: C.purple }]}>
              {member.outlets_visited}
            </Text>
            <Text style={styles.teamStatLabel}>Visited</Text>
          </View>
          <View style={styles.teamStatDivider} />
          <View style={styles.teamStatCol}>
            <Text style={[styles.teamStatVal, { color: C.amber }]}>
              {member.orders}
            </Text>
            <Text style={styles.teamStatLabel}>Orders</Text>
          </View>
          <View style={styles.teamStatDivider} />
          <View style={styles.teamStatCol}>
            <Text style={[styles.teamStatVal, { color: C.green }]}>
              {member.order_value > 0
                ? `₹${(member.order_value / 1000).toFixed(1)}K`
                : '—'}
            </Text>
            <Text style={styles.teamStatLabel}>Value</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface TeamSectionProps {
  team: AsmTeamMember[];
  metrics: AsmKeyMetrics;
  navigation: any;
  // Pass the currently selected dashboard date as a YYYY-MM-DD string
  selectedDateStr: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  metrics,
  navigation,
  selectedDateStr,
}) => (
  <View style={{ marginBottom: 30 }}>
    <View style={styles.teamSectionHeader}>
      <SectionHeader icon={Users} title="Team Performance" accent={C.amber} />
      <View style={styles.teamSummaryBadges}>
        <View style={styles.presentCount}>
          <CheckCircle size={10} color={C.green} strokeWidth={2.5} />
          <Text style={[styles.countText, { color: C.green }]}>
            {metrics.team_present}
          </Text>
        </View>
        <View style={styles.absentCount}>
          <AlertCircle size={10} color={C.red} strokeWidth={2.5} />
          <Text style={[styles.countText, { color: C.red }]}>
            {metrics.team_absent}
          </Text>
        </View>
      </View>
    </View>
    <View style={styles.attendanceBar}>
      <View
        style={[
          styles.attendanceBarFill,
          {
            width: `${metrics.attendance_rate}%` as `${number}%`,
            backgroundColor: C.green,
          },
        ]}
      />
      <View
        style={[
          styles.attendanceBarFill,
          {
            width: `${100 - metrics.attendance_rate}%` as `${number}%`,
            backgroundColor: C.red,
            opacity: 0.4,
          },
        ]}
      />
    </View>
    <Text style={styles.attendanceLabel}>
      {metrics.attendance_rate}% attendance today
    </Text>
    {team?.map(member => (
      <TeamMemberCard
        key={member.employee_id}
        member={member}
        // ← Pass employee_id and the dashboard date (already a YYYY-MM-DD string)
        onPress={() =>
          navigation?.navigate('TeamDetailScreen', {
            employee_id: member.employee_id,
            date: selectedDateStr, // string, never a Date object
          })
        }
      />
    ))}
  </View>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
interface AsmDashboardProps {
  navigation: any;
}

const AsmDashboard: React.FC<AsmDashboardProps> = ({ navigation }) => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const employee = useAppSelector(
    state => state?.persistedReducer?.authSlice?.employee,
  );
  // ── Date state ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [iosTempDate, setIosTempDate] = useState<Date>(new Date());

  const [category1, setCategory1] = useState<string>('');

  // ── Store type filter (from AsmStoreTypeComponent) ────────────────────────
  const [selectedStoreType, setSelectedStoreType] = useState<string>('');

  const [refreshing, setRefreshing] = useState(false);

  // ── API ───────────────────────────────────────────────────────────────────
  const { data, isFetching, isError, error, refetch } = useGetAsmDashboardQuery(
    {
      date: toApiDate(selectedDate),
      employee: employee?.id as string,
      // Optional filters
      ...(selectedStoreType ? { store_type: selectedStoreType } : {}),
      ...(category1 ? { view_type: category1 } : {}),
    },
    { refetchOnMountOrArgChange: true, skip: !employee?.id },
  );
  console.log("🚀 ~ AsmDashboard ~ data:", data)
  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  // ── Date picker handlers ──────────────────────────────────────────────────
  const openPicker = () => {
    setIosTempDate(selectedDate);
    setShowPicker(true);
  };

  const onAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
  };

  const onIosChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setIosTempDate(date);
    }
  };

  const confirmIos = () => {
    setSelectedDate(iosTempDate);
    setShowPicker(false);
  };

  // ── Picker renderer ───────────────────────────────────────────────────────
  const renderPicker = () => {
    if (!showPicker) {
      return null;
    }
    if (Platform.OS === 'android') {
      return (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onAndroidChange}
        />
      );
    }
    return (
      <Modal
        transparent
        animationType="slide"
        visible={showPicker}
        onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <X size={20} color={C.textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={iosTempDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={onIosChange}
              style={styles.iosPicker}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowPicker(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={confirmIos}>
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isFetching && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.accent} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError || !data?.message?.success) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surface} />
        <View
          style={{
            backgroundColor: C.surface,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            {DURATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setCategory1(opt.value)}
                style={[
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    marginRight: 8,
                  },
                  category1 === opt.value
                    ? { backgroundColor: C.accent, borderColor: C.accent }
                    : { backgroundColor: C.bg, borderColor: C.border },
                ]}>
                <Text
                  style={{
                    color: category1 === opt.value ? C.surface : C.text,
                    fontSize: 14,
                    fontWeight: category1 === opt.value ? '600' : '400',
                  }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <DateSelectorBar
          label={toDisplayDate(selectedDate)}
          onPress={openPicker}
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {(data?.message as any)?.error || 'Failed to load dashboard'}
          </Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
        {renderPicker()}
      </View>
    );
  }

  const msg = data.message;

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surface} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.accent]}
            tintColor={C.accent}
          />
        }>
        {/* ── Duration filter chips ── */}
        <View
          style={{
            backgroundColor: C.surface,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
          }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            {DURATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setCategory1(opt.value)}
                style={[
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    marginRight: 8,
                  },
                  category1 === opt.value
                    ? { backgroundColor: C.accent, borderColor: C.accent }
                    : { backgroundColor: C.bg, borderColor: C.border },
                ]}>
                <Text
                  style={{
                    color: category1 === opt.value ? C.surface : C.text,
                    fontSize: 14,
                    fontWeight: category1 === opt.value ? '600' : '400',
                  }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <DateSelectorBar
          label={toDisplayDate(selectedDate)}
          onPress={openPicker}
        />

        <DashboardHeader
          formattedDate={msg.formatted_date}
          overview={msg.asm_overview}
          company_emp_id={employee?.company_emp_id as string}
        />

        <View style={styles.body}>
          {/* Store type filter — selection re-triggers the dashboard API */}
          <AsmStoreTypeComponent
            value={selectedStoreType}
            onChange={setSelectedStoreType}
          />

          <KpiGrid metrics={msg.key_metrics} />
          <View style={styles.divider} />
          <StorePlanning planning={msg.store_planning} />
          <View style={styles.divider} />
          <BusinessSummary business={msg.business_generated} />
          <View style={styles.divider} />
          <OrdersSection orders={msg.order_status} navigation={navigation} date={toApiDate(selectedDate)} />
          <View style={styles.divider} />
          <TeamSection
            team={msg.team_performance}
            metrics={msg.key_metrics}
            navigation={navigation}
            // ✅ Always a YYYY-MM-DD string — never a Date object
            selectedDateStr={toApiDate(selectedDate)}
          />
        </View>
      </ScrollView>

      {renderPicker()}
    </View>
  );
};

export default AsmDashboard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  // scrollContent: {paddingBottom: 40},

  // Loading / Error
  centeredOuter: { flex: 1, backgroundColor: C.bg },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
    gap: 12,
  },
  loadingText: { color: C.textMuted, fontSize: 13, marginTop: 8 },
  errorText: { color: C.text, fontSize: 14, fontWeight: '600' },
  retryBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Date selector bar ──────────────────────────────────────────────────────
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  dateBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateBarIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBarHint: {
    color: C.textMuted,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  dateBarLabel: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 1 },
  dateBarChevron: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${C.accent}40`,
  },

  // Header
  header: {
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerAccentBar: { height: 4, backgroundColor: C.accent },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  headerDate: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  headerName: {
    color: C.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
    flexWrap: 'wrap',
  },
  headerDesig: { color: C.textSub, fontSize: 11, fontWeight: '500' },
  attendanceBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  attendanceBadgeText: { fontSize: 10, fontWeight: '700' },
  checkInText: { color: C.textMuted, fontSize: 10 },
  headerIdBox: {
    backgroundColor: C.accentSoft,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  headerIdLabel: {
    color: C.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headerIdVal: { color: C.amber, fontSize: 16, fontWeight: '800', marginTop: 2 },

  // Body
  body: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 20 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // KPI
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  kpiLabel: { color: C.textSub, fontSize: 11, fontWeight: '500', marginTop: 2 },
  kpiSub: { color: C.textMuted, fontSize: 10, marginTop: 3 },

  // Plan
  planCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planLabel: { color: C.textSub, fontSize: 11, fontWeight: '500' },
  progressTrack: {
    height: 7,
    backgroundColor: '#F0F2F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },

  // Business
  bizCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bizGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bizItem: { alignItems: 'center', flex: 1 },
  bizVal: { fontSize: 16, fontWeight: '800' },
  bizLabel: { color: C.textMuted, fontSize: 10, marginTop: 3 },
  bizDivider: { width: 1, height: 36, backgroundColor: C.border },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.redSoft,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: `${C.red}20`,
  },
  deliveryText: { color: C.textSub, fontSize: 11 },

  // Orders
  orderCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  orderStripe: {
    width: 3,
  },
  orderBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    color: C.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusTag: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStore: {
    color: C.text,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  orderValue: {
    color: C.text,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Team
  teamSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamSummaryBadges: { flexDirection: 'row', gap: 8 },
  presentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.greenSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${C.green}25`,
  },
  absentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.redSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${C.red}25`,
  },
  countText: { fontSize: 11, fontWeight: '700' },
  attendanceBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
    marginTop: 6,
    backgroundColor: C.border,
  },
  attendanceBarFill: { height: '100%' },
  attendanceLabel: {
    color: C.textMuted,
    fontSize: 10,
    marginBottom: 14,
    fontWeight: '500',
  },
  teamCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  teamCardLeft: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  teamNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamName: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: width * 0.5,
  },
  roleBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  roleText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  teamStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  teamStatus: { fontSize: 10, fontWeight: '500' },
  teamStats: {
    flexDirection: 'row',
    backgroundColor: '#F0F2F6',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  teamStatCol: { alignItems: 'center' },
  teamStatVal: { color: C.text, fontSize: 15, fontWeight: '800' },
  teamStatLabel: {
    color: C.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
  teamStatDivider: { width: 1, height: 28, backgroundColor: C.border },

  // ── iOS date picker modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 4,
  },
  modalTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  iosPicker: { width: '100%' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalCancelText: { color: C.textSub, fontWeight: '600', fontSize: 14 },
  modalConfirm: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: C.accent,
  },
  modalConfirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // emptyText: {
  //   fontSize: 13,
  //   color: C.textMuted,
  //   textAlign: 'center',
  //   paddingVertical: 20,
  // },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  viewAllText: {
    fontSize: 13,
    color: C.textMuted,
  },
});

