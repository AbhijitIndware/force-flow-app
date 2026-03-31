import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import {ChevronDown, Tag, Check} from 'lucide-react-native';
import {Fonts} from '../../constants';
import {Size} from '../../utils/fontSize';

const ORANGE = '#F97316';
const ORANGE_LIGHT = '#FFF7F0';
const ORANGE_BORDER = '#F97316';

interface Option {
  label: string;
  value: string;
}
interface Props {
  label: string;
  field: string;
  value: string;
  data: Option[];
  onChange: (val: string) => void;
}

const ReusableDropdownV3: React.FC<Props> = ({
  label,
  value,
  data,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const selectedLabel = data.find(d => d.value === value)?.label;

  const openSheet = () => {
    setOpen(true);
    Animated.spring(anim, {toValue: 1, useNativeDriver: true}).start();
  };

  const closeSheet = () => {
    Animated.spring(anim, {toValue: 0, useNativeDriver: true}).start(() =>
      setOpen(false),
    );
  };

  const pick = (val: string) => {
    onChange(val);
    setTimeout(closeSheet, 150);
  };

  const chevron = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const isActive = !!value;

  return (
    <View style={styles.wrapper}>
      {/* Field label */}
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>

      {/* Trigger */}
      <TouchableOpacity
        style={[styles.trigger, isActive && styles.triggerActive]}
        onPress={openSheet}
        activeOpacity={0.85}>
        <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
          <Tag size={15} color={isActive ? ORANGE : '#888'} strokeWidth={2} />
        </View>
        <Text style={isActive ? styles.triggerValue : styles.placeholder}>
          {selectedLabel ?? `Select ${label}`}
        </Text>
        <Animated.View style={{transform: [{rotate: chevron}]}}>
          <ChevronDown
            size={18}
            color={isActive ? ORANGE : '#888'}
            strokeWidth={2.2}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeSheet}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select {label}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={closeSheet}>
              <Text style={styles.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={i => i.value}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={{paddingBottom: 30}}
            renderItem={({item}) => {
              const sel = item.value === value;
              return (
                <TouchableOpacity
                  style={[styles.option, sel && styles.optionSel]}
                  onPress={() => pick(item.value)}
                  activeOpacity={0.7}>
                  <View style={[styles.dot, sel && styles.dotSel]} />
                  <Text style={[styles.optTxt, sel && styles.optTxtSel]}>
                    {item.label}
                  </Text>
                  {sel && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default ReusableDropdownV3;

const styles = StyleSheet.create({
  wrapper: {marginBottom: 16},

  fieldLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#888',
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {elevation: 2},
    }),
  },
  triggerActive: {
    borderColor: ORANGE_BORDER,
    backgroundColor: ORANGE_LIGHT,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {backgroundColor: '#FFE8D4'},

  triggerValue: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#1A1A1A',
  },
  placeholder: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: '#AAA',
  },

  // Sheet
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.38)'},
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: '65%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {elevation: 20},
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Size.md,
    color: '#1A1A1A',
  },
  doneBtn: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  doneTxt: {fontFamily: Fonts.semiBold, fontSize: 13, color: '#fff'},

  sep: {height: 0.5, backgroundColor: '#F0F0F0', marginHorizontal: 18},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#FAFAFA',
  },
  optionSel: {backgroundColor: ORANGE_LIGHT},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB'},
  dotSel: {backgroundColor: ORANGE},
  optTxt: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Size.xsmd,
    color: '#1A1A1A',
  },
  optTxtSel: {fontFamily: Fonts.semiBold, color: ORANGE},
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
