import React from 'react';
import {View} from 'react-native';
import {
  ClipboardCheck,
  Import,
  Undo2,
  Upload,
  UserRound,
} from 'lucide-react-native';

import {Colors} from '../../../utils/colors';

type IconProps = {color: string; size: number; strokeWidth?: number};

// Person with a return arrow: lucide has no single glyph for this.
const CustomerReturnIcon = ({color, size, strokeWidth = 2}: IconProps) => (
  <View style={{width: size, height: size}}>
    <UserRound color={color} size={size} strokeWidth={strokeWidth} />
    <View
      style={{position: 'absolute', right: -size * 0.15, bottom: -size * 0.1}}>
      <Undo2 color={color} size={size * 0.5} strokeWidth={strokeWidth + 0.5} />
    </View>
  </View>
);

// Returns to distributor are hidden for now; flip to bring back the Quick
// link, the history filter and the history rows.
export const SHOW_DISTRIBUTOR_RETURNS = true;

// One name, icon and colour per stock screen, shared by Quick links, the
// bottom bar and the screen headers so they never drift apart.
export const STOCK_SCREENS = {
  count: {
    title: 'Count Stock',
    color: Colors.darkButton,
    Icon: ClipboardCheck as React.ComponentType<IconProps>,
  },
  receive: {
    title: 'Receive Stock from Distributor',
    color: '#15803D',
    Icon: Import as React.ComponentType<IconProps>,
  },
  customerReturn: {
    title: 'Customer Return',
    color: '#2563EB',
    Icon: CustomerReturnIcon,
  },
  distributorReturn: {
    title: 'Return to Distributor',
    color: '#EA580C',
    Icon: Upload as React.ComponentType<IconProps>,
  },
} as const;

export type StockScreenKey = keyof typeof STOCK_SCREENS;

// Header icon: the screen's icon in its colour.
export const StockScreenIcon = ({
  screen,
  size = 20,
}: {
  screen: StockScreenKey;
  size?: number;
}) => {
  const {Icon, color} = STOCK_SCREENS[screen];
  return <Icon color={color} size={size} strokeWidth={2} />;
};
