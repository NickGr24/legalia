import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { useBurgerMenu } from '../contexts/BurgerMenuContext';
import { colors } from '../utils/colors';
import { t } from '../i18n';

const BUTTON_SIZE = 44;
const LINE_WIDTH = 22;
const LINE_HEIGHT = 2.5;
const LINE_SPACING = 5;

export const BurgerButton: React.FC = () => {
  const { toggle, progress, isOpen } = useBurgerMenu();

  const topLineRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const topLineTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 7],
  });

  const middleLineOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const middleLineScaleX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  const bottomLineRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });

  const bottomLineTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
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
        <Animated.View 
          style={[
            styles.line, 
            {
              transform: [
                { translateY: topLineTranslateY },
                { rotateZ: topLineRotate },
              ],
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.line, 
            styles.middleLine, 
            {
              opacity: middleLineOpacity,
              transform: [{ scaleX: middleLineScaleX }],
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.line, 
            {
              transform: [
                { translateY: bottomLineTranslateY },
                { rotateZ: bottomLineRotate },
              ],
            }
          ]} 
        />
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