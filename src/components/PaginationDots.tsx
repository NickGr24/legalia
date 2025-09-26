import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { spacing, borderRadius } from '@/utils/styles';
import { colors } from '@/utils/colors';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
  dotSize?: number;
  activeDotSize?: number;
  spacing?: number;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  activeIndex,
  dotSize = 8,
  activeDotSize = 12,
  spacing: dotSpacing = spacing.sm,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === activeIndex;
        const size = isActive ? activeDotSize : dotSize;
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: isActive ? colors.ai.primary : colors.border.medium,
                marginHorizontal: dotSpacing / 2,
              },
              isActive && styles.activeDot,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  dot: {
    opacity: 0.6,
  },
  activeDot: {
    opacity: 1,
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});