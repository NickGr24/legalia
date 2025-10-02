import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize, shadows, commonStyles } from '../utils/styles';
import { colors } from '../utils/colors';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 20,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
        },
        checked && styles.checked,
        disabled && styles.checkboxDisabled,
      ]}>
        {checked && (
          <View style={[
            styles.checkmark,
            {
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: size * 0.1,
            },
          ]} />
        )}
      </View>
      
      {label && (
        <Text style={[
          styles.label,
          disabled && styles.labelDisabled,
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkbox: {
    backgroundColor: colors.surface.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  checked: {
    backgroundColor: colors.ai.primary,
    borderColor: colors.ai.primary,
  },
  checkmark: {
    backgroundColor: colors.text.onPrimary,
  },
  label: {
    ...commonStyles.bodyMD,
    marginLeft: spacing.sm,
    color: colors.text.primary,
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  checkboxDisabled: {
    backgroundColor: colors.border.light,
  },
  labelDisabled: {
    color: colors.text.tertiary,
  },
});