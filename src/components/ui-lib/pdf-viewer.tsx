import React, {useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Pdf from 'react-native-pdf';
import {Colors} from '../../utils/colors';
import {ArrowLeft, Download} from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  uri: string;
  onDownload?: () => void;
}

const PdfPreviewModal: React.FC<Props> = ({
  visible,
  onClose,
  uri,
  onDownload,
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent={false}>
      <View style={styles.container}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <ArrowLeft size={22} color={Colors.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            PDF Preview
          </Text>

          {onDownload ? (
            <TouchableOpacity onPress={onDownload} style={styles.iconBtn}>
              <Download size={20} color={Colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{width: 40}} />
          )}
        </View>

        {/* ---------- LOADER ---------- */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading document…</Text>
          </View>
        )}

        {/* ---------- PDF VIEW ---------- */}
        <Pdf
          source={{uri, cache: true}}
          style={styles.pdf}
          trustAllCerts={false}
          onLoadComplete={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </View>
    </Modal>
  );
};

export default PdfPreviewModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: '#fff',
    elevation: 4,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },

  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },

  pdf: {
    flex: 1,
    width: '100%',
  },
});
