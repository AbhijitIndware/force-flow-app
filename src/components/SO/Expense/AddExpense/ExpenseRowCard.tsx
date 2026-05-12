import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Trash2, Upload} from 'lucide-react-native';
import moment from 'moment';
import {Colors} from '../../../../utils/colors';
import {Fonts} from '../../../../constants';
import {Size} from '../../../../utils/fontSize';
import {LocalExpenseItem} from '../add-expense';

const TYPE_CONFIG: Record<string, {icon: string; bg: string}> = {
  'Daily Allowance': {icon: '💵', bg: '#EAF3DE'},

  'TA - Auto': {icon: '🛺', bg: '#E6F1FB'},
  'TA - Cab': {icon: '🚕', bg: '#E6F1FB'},
  'TA - Bus': {icon: '🚌', bg: '#E6F1FB'},
  'TA - Rail': {icon: '🚆', bg: '#E6F1FB'},
  'TA - Bike (Petrol)': {icon: '🏍️', bg: '#E6F1FB'},
  'TA - Local Travel': {icon: '🚗', bg: '#E6F1FB'},

  'Lodging / Boarding / Hotel': {icon: '🏨', bg: '#FAEEDA'},

  'Food / Meals': {icon: '🍽️', bg: '#FFF4E5'},

  'Mobile Bill': {icon: '📱', bg: '#EEEDFE'},

  Courier: {icon: '📦', bg: '#FAECE7'},
  Xerox: {icon: '📄', bg: '#FAECE7'},
};

const normalizeExpenseType = (type: string) =>
  type?.replace(/[–—]/g, '-').trim();

type Props = {
  expense: LocalExpenseItem;
  loading: boolean;
  onRemove: any;
};

export const ExpenseRowCard = ({expense, loading, onRemove}: Props) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const normalizedExpenseType = normalizeExpenseType(expense.expense_type);
  const config = TYPE_CONFIG[normalizedExpenseType] ?? {
    icon: '💰',
    bg: '#F1EFE8',
  };
  const attachmentUri = expense.attachment?.uri || expense.attachment?.url;
  const isPDF = (attachment: any) => {
    const name = attachment?.name || attachment?.uri || attachment?.url || '';
    return typeof name === 'string' && name.toLowerCase().includes('.pdf');
  };

  return (
    <>
      <View style={styles.card}>
        <View style={[styles.iconBox, {backgroundColor: config.bg}]}>
          <Text style={{fontSize: 18}}>{config.icon}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.type}>{expense.expense_type}</Text>
          <Text style={styles.meta}>
            {moment(expense.expense_date).format('MMM D, YYYY')}
            {expense.ta_mode ? ` · ${expense.ta_mode}` : ''}
            {expense.ta_rail_class ? ` · ${expense.ta_rail_class}` : ''}
          </Text>
          {expense.custom_claim_description ? (
            <Text style={styles.desc} numberOfLines={3}>
              {expense.custom_claim_description}
            </Text>
          ) : null}
          {expense.attachment ? (
            <TouchableOpacity
              style={styles.attachPill}
              onPress={() => {
                setImageError('');
                setShowImagePreview(true);
              }}>
              <Upload size={11} color="#888" />
              <Text style={styles.attachText} numberOfLines={1}>
                {expense.attachment.name}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>
            ₹ {expense.amount.toLocaleString('en-IN')}
          </Text>
          <TouchableOpacity
            disabled={loading}
            onPress={onRemove}
            style={[styles.removeBtn, loading && {opacity: 0.5}]}>
            <Trash2 size={12} color="#A32D2D" />
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}>
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowImagePreview(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {attachmentUri ? (
            isPDF(expense.attachment) ? (
              <View style={styles.pdfPlaceholder}>
                <Text style={styles.pdfText}>
                  PDF preview is not supported.
                </Text>
              </View>
            ) : (
              <>
                {imageLoading && (
                  <ActivityIndicator
                    size="large"
                    color={Colors.white}
                    style={styles.imageLoader}
                  />
                )}
                <Image
                  source={{uri: attachmentUri}}
                  style={styles.fullImage}
                  resizeMode="contain"
                  onLoadStart={() => {
                    setImageError('');
                    setImageLoading(true);
                  }}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError('Unable to load attachment preview.');
                  }}
                />
                {imageError ? (
                  <Text style={styles.previewErrorText}>{imageError}</Text>
                ) : null}
              </>
            )
          ) : (
            <View style={styles.pdfPlaceholder}>
              <Text style={styles.pdfText}>No attachment available</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  type: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.darkButton,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray,
  },
  desc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray,
    marginTop: 2,
  },
  attachPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  attachText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.gray,
    maxWidth: 120,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.sucess,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCEBEB',
    borderWidth: 0.5,
    borderColor: '#F7C1C1',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: '#A32D2D',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageLoader: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
  },
  pdfPlaceholder: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pdfText: {
    color: Colors.white,
    fontFamily: Fonts.regular,
    fontSize: Size.sm,
    textAlign: 'center',
  },
  previewErrorText: {
    marginTop: 12,
    color: '#F87171',
    fontFamily: Fonts.regular,
    fontSize: Size.xs,
    textAlign: 'center',
  },
});
