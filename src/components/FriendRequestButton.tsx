/**
 * FriendRequestButton Component
 * Shows friend request status and allows sending/canceling requests
 * Used in other user profiles
 */

import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { friendsService } from '@/services/friendsService';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '@/utils/styles';
import { colors } from '@/utils/colors';

interface FriendRequestButtonProps {
  targetUserId: string;
  onStatusChange?: (status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends') => void;
  style?: ViewStyle;
  compact?: boolean;
}

export const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({
  targetUserId,
  onStatusChange,
  style,
  compact = false,
}) => {
  const [status, setStatus] = useState<
    'none' | 'pending_outgoing' | 'pending_incoming' | 'friends' | 'loading'
  >('loading');
  const [friendshipId, setFriendshipId] = useState<string | undefined>();
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial friendship status
  useEffect(() => {
    checkStatus();
  }, [targetUserId]);

  const checkStatus = async () => {
    try {
      const result = await friendsService.checkFriendshipStatus(targetUserId);
      if (result) {
        setStatus(result.status);
        setFriendshipId(result.friendshipId);
        onStatusChange?.(result.status);
      } else {
        setStatus('none');
      }
    } catch (err) {
      console.error('Error checking friendship status:', err);
      setStatus('none');
    }
  };

  const handleSendRequest = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const friendship = await friendsService.sendFriendRequest(targetUserId);
      setStatus('pending_outgoing');
      setFriendshipId(friendship.id);
      onStatusChange?.('pending_outgoing');
    } catch (err: any) {
      setError(err.message || 'Eroare la trimiterea cererii');
      // Refresh status in case it changed
      await checkStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!friendshipId) return;

    setActionLoading(true);
    setError(null);
    try {
      await friendsService.cancelFriendRequest(friendshipId);
      setStatus('none');
      setFriendshipId(undefined);
      onStatusChange?.('none');
    } catch (err: any) {
      setError(err.message || 'Eroare la anularea cererii');
      await checkStatus();
    } finally {
      setActionLoading(false);
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'loading':
        return {
          text: 'Se încarcă...',
          variant: 'disabled' as const,
          onPress: () => {},
          disabled: true,
        };
      case 'friends':
        return {
          text: compact ? 'Prieten' : 'Sunteți prieteni',
          variant: 'friends' as const,
          onPress: () => {},
          disabled: true,
        };
      case 'pending_outgoing':
        return {
          text: compact ? 'Trimisă' : 'Cerere trimisă',
          variant: 'pending' as const,
          onPress: handleCancelRequest,
          disabled: false,
        };
      case 'pending_incoming':
        return {
          text: compact ? 'Răspunde' : 'Răspunde la cerere',
          variant: 'respond' as const,
          onPress: () => {},
          disabled: true, // Should navigate to inbox instead
        };
      case 'none':
      default:
        return {
          text: compact ? 'Adaugă' : 'Adaugă prieten',
          variant: 'primary' as const,
          onPress: handleSendRequest,
          disabled: false,
        };
    }
  };

  const config = getButtonConfig();
  const isLoading = status === 'loading' || actionLoading;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          compact && styles.compactButton,
          styles[`${config.variant}Button`],
          config.disabled && styles.disabled,
          style,
        ]}
        onPress={config.onPress}
        disabled={config.disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={
              config.variant === 'primary'
                ? colors.text.onPrimary
                : colors.ai.primary
            }
          />
        ) : (
          <Text
            style={[
              styles.text,
              compact && styles.compactText,
              styles[`${config.variant}Text`],
            ]}
          >
            {config.text}
          </Text>
        )}
      </TouchableOpacity>
      {error && !isLoading && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    ...shadows.small,
  },
  compactButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },

  // Variants
  primaryButton: {
    backgroundColor: colors.ai.primary,
  },
  friendsButton: {
    backgroundColor: colors.success.main,
  },
  pendingButton: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  respondButton: {
    backgroundColor: colors.warning.main,
  },
  disabledButton: {
    backgroundColor: colors.surface.elevated,
    opacity: 0.6,
  },

  // Text styles
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  compactText: {
    fontSize: fontSize.sm,
  },

  // Text variants
  primaryText: {
    color: colors.text.onPrimary,
  },
  friendsText: {
    color: colors.text.onPrimary,
  },
  pendingText: {
    color: colors.text.secondary,
  },
  respondText: {
    color: colors.text.onPrimary,
  },
  disabledText: {
    color: colors.text.disabled,
  },

  // Disabled state
  disabled: {
    opacity: 0.6,
    ...shadows.none,
  },

  // Error text
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default FriendRequestButton;
