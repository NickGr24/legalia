import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import { useBurgerMenu } from '@/contexts/BurgerMenuContext';
import { colors } from '@/utils/colors';
import { t } from '@/i18n';

const BUTTON_SIZE = 44;
const LINE_WIDTH = 22;
const LINE_HEIGHT = 2.5;
const LINE_SPACING = 5;

export const BurgerButton: React.FC = () => {
  const { toggle, progress, isOpen } = useBurgerMenu();

  const topLineStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 45]);
    const translateY = interpolate(progress.value, [0, 1], [0, 7]);

    return {
      transform: [
        { translateY: withSpring(translateY) },
        { rotateZ: withSpring(`${rotate}deg`) },
      ],
    };
  });

  const middleLineStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [1, 0]);
    const scaleX = interpolate(progress.value, [0, 1], [1, 0.6]);

    return {
      opacity: withSpring(opacity),
      transform: [{ scaleX: withSpring(scaleX) }],
    };
  });

  const bottomLineStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, -45]);
    const translateY = interpolate(progress.value, [0, 1], [0, -7]);

    return {
      transform: [
        { translateY: withSpring(translateY) },
        { rotateZ: withSpring(`${rotate}deg`) },
      ],
    };
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={toggle}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={isOpen ? t('menu_close') : t('menu_open')}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.line, topLineStyle]} />
        <Animated.View style={[styles.line, styles.middleLine, middleLineStyle]} />
        <Animated.View style={[styles.line, bottomLineStyle]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  container: {
    width: LINE_WIDTH,
    height: LINE_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: LINE_WIDTH,
    height: LINE_HEIGHT,
    backgroundColor: colors.primary.main,
    borderRadius: 2,
    position: 'absolute',
  },
  middleLine: {
    transformOrigin: 'center',
  },
});