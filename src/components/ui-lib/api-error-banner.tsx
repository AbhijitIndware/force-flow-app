/**
 * ApiErrorBanner — drop this at the top of any screen to display RTK Query errors.
 *
 * Usage:
 *   const { error } = useSomeQuery(...);
 *   const { error: mutateError } = useSomeMutation();
 *
 *   return (
 *     <View style={{flex: 1}}>
 *       <ApiErrorBanner errors={[error, mutateError]} />
 *       ...rest of screen
 *     </View>
 *   );
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import type {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import type {SerializedError} from '@reduxjs/toolkit';

// ── Types ─────────────────────────────────────────────────────────────────────
type RtkError = FetchBaseQueryError | SerializedError | undefined;

interface ApiErrorBannerProps {
  /** Pass one or more RTK Query error objects. The first non-null one wins. */
  errors: RtkError[];
  /** Override the auto-extracted message */
  message?: string;
  /** Auto-dismiss after ms (default: 5000). Pass 0 to disable. */
  autoDismissMs?: number;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

// ── Message extractor ─────────────────────────────────────────────────────────
export function extractApiErrorMessage(error: RtkError): string | null {
  if (!error) return null;

  // FetchBaseQueryError with status + data
  if ('status' in error) {
    const data = (error as any).data;

    // Frappe/ERPNext style: { message: "..." } or { exc_type: "...", message: "..." }
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    if (data?.exception && typeof data.exception === 'string') {
      return data.exception;
    }
    if (data?._server_messages) {
      try {
        const msgs = JSON.parse(data._server_messages);
        if (Array.isArray(msgs) && msgs.length > 0) {
          // Some messages are strings, some are JSON strings
          try {
            const parsed = JSON.parse(msgs[0]);
            return parsed?.message || msgs[0];
          } catch {
            return msgs[0];
          }
        }
      } catch {}
    }

    // Generic HTTP error
    const status = error.status;
    if (status === 'FETCH_ERROR') return 'Network error — could not reach server.';
    if (status === 'PARSING_ERROR') return 'Unexpected server response.';
    if (status === 'TIMEOUT_ERROR') return 'Request timed out.';
    if (typeof status === 'number') {
      if (status === 400) return 'Bad request — please check your input.';
      if (status === 403) return 'You do not have permission to do this.';
      if (status === 404) return 'Resource not found.';
      if (status === 500) return 'Server error — please try again later.';
      return `Request failed (${status}).`;
    }
  }

  // SerializedError
  if ('message' in error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

// ── Component ─────────────────────────────────────────────────────────────────
const ApiErrorBanner: React.FC<ApiErrorBannerProps> = ({
  errors,
  message,
  autoDismissMs = 5000,
  onDismiss,
}) => {
  const [visible, setVisible] = React.useState(false);
  const [displayMessage, setDisplayMessage] = React.useState('');
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Pick the first non-null error
  const activeError = errors.find(e => !!e);
  const resolvedMessage =
    message ?? (activeError ? extractApiErrorMessage(activeError) : null);

  React.useEffect(() => {
    if (resolvedMessage) {
      setDisplayMessage(resolvedMessage);
      setVisible(true);

      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss
      if (autoDismissMs > 0) {
        const timer = setTimeout(() => dismiss(), autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else if (visible) {
      dismiss();
    }
  }, [resolvedMessage]);

  const dismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, {opacity}]}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      <Text style={styles.message} numberOfLines={3}>
        {displayMessage}
      </Text>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={8}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  iconWrap: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    flex: 1,
    color: '#FEE2E2',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
  },
  closeIcon: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ApiErrorBanner;
