import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../utils/colors';
import { layoutSpacing } from '../utils/layout';
import { borderRadii } from '../utils/shadow';
import { t } from '../i18n';
import { AppButton } from './AppButton';
import { PaginationDots } from './PaginationDots';

interface BottomStepperProps {
  page: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  skipLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const BottomStepper: React.FC<BottomStepperProps> = ({
  page,
  total,
  onPrev,
  onNext,
  onSkip,
  nextLabel = t('btn_next'),
  prevLabel = t('btn_back'),
  skipLabel = t('btn_skip'),
  nextDisabled = false,
  nextLoading = false,
}) => {
  const insets = useSafeAreaInsets();

  const canGoPrev = page > 0 && onPrev;
  const canGoNext = page < total - 1 && onNext;
  const canSkip = page < total - 1 && onSkip;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <PaginationDots total={total} activeIndex={page} />
      </View>

      {/* Button Toolbar */}
      <View style={styles.toolbar}>
        {/* Left Button - Back */}
        <AppButton
          variant="secondary"
          size="medium"
          onPress={onPrev}
          disabled={!canGoPrev}
          style={styles.backButton}
        >
          {prevLabel}
        </AppButton>

        {/* Center Button - Next/Submit */}
        <AppButton
          variant="primary"
          size="medium"
          onPress={onNext}
          disabled={nextDisabled || !canGoNext}
          loading={nextLoading}
          style={styles.nextButton}
        >
          {nextLabel}
        </AppButton>

        {/* Right Button - Skip */}
        {canSkip ? (
          <AppButton
            variant="text"
            size="medium"
            onPress={onSkip}
            style={styles.skipButton}
          >
            {skipLabel}
          </AppButton>
        ) : (
          <View style={styles.skipButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: layoutSpacing.md,
    paddingHorizontal: layoutSpacing.lg,
  },
  
  dotsContainer: {
    alignItems: 'center',
    marginBottom: layoutSpacing.md,
  },
  
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layoutSpacing.sm,
  },
  
  backButton: {
    minWidth: 112,
  },
  
  nextButton: {
    flex: 1,
    maxWidth: screenWidth * 0.4,
  },
  
  skipButton: {
    minWidth: 72,
  },
});