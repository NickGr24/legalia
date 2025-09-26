import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';

interface AnswerOptionProps {
  id: number;
  text: string;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onPress: () => void;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  id,
  text,
  isSelected,
  isCorrect,
  showResult,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      // Scale up animation for selected option
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected]);

  useEffect(() => {
    if (isSelected && !showResult) {
      // Keep selected option fully visible
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (!isSelected && !showResult) {
      // Fade out non-selected options slightly when something is selected
      const hasSelection = isSelected !== null;
      const targetOpacity = hasSelection ? 0.6 : 1;
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset opacity for result view
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected, showResult]);
  const getOptionStyle = () => {
    if (showResult) {
      if (isCorrect) {
        return [styles.option, styles.correctOption];
      }
      if (isSelected && !isCorrect) {
        return [styles.option, styles.incorrectOption];
      }
      return [styles.option, styles.defaultOption];
    }
    
    if (isSelected) {
      return [styles.option, styles.selectedOption];
    }
    
    return [styles.option, styles.defaultOption];
  };

  const getOptionTextStyle = () => {
    if (showResult && isCorrect) {
      return [styles.optionText, styles.correctOptionText];
    }
    if (isSelected) {
      return [styles.optionText, styles.selectedOptionText];
    }
    return [styles.optionText, styles.defaultOptionText];
  };

  const getIcon = () => {
    if (!showResult) return null;
    
    if (isCorrect) {
      return <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />;
    }
    if (isSelected && !isCorrect) {
      return <Ionicons name="close-circle" size={24} color={colors.status.error} />;
    }
    return null;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity
        style={getOptionStyle()}
        onPress={onPress}
        disabled={showResult}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Text style={getOptionTextStyle()}>
            {text}
          </Text>
          {getIcon()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  option: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md, 
    marginBottom: spacing.sm, 
    ...shadows.small,
  },
  
  defaultOption: {
    borderColor: colors.border.light,
  },
  
  selectedOption: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '20',
  },
  
  correctOption: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.success + '20',
  },
  
  incorrectOption: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error + '20',
  },
  
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  optionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    flex: 1,
    lineHeight: fontSize.md * 1.2, // Уменьшаем line height
    fontFamily: fontConfig.body,
  },
  
  defaultOptionText: {
    color: colors.text.primary,
  },
  
  selectedOptionText: {
    color: colors.primary.main,
    fontWeight: fontWeight.semibold,
  },
  
  correctOptionText: {
    color: colors.status.success,
    fontWeight: fontWeight.semibold,
  },
}); 