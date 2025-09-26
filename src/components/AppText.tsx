import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';
import { fontConfig } from '@/utils/fonts';
import { typography } from '@/utils/layout';

interface AppTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'button';
  color?: keyof typeof colors.text;
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const textColor = colors.text[color];
  const finalColor = Array.isArray(textColor) ? textColor[0] : textColor;
  
  const textStyle = [
    styles.base,
    styles[variant],
    { color: finalColor },
    weight && styles[`weight_${weight}`],
    align && styles[`align_${align}`],
    style,
  ];

  return (
    <Text
      {...props}
      style={textStyle}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: fontConfig.body,
  },
  
  // Variants
  title: {
    fontSize: typography.title.fontSize,
    lineHeight: typography.title.lineHeight,
    fontWeight: '700',
  },
  
  subtitle: {
    fontSize: typography.subtitle.fontSize,
    lineHeight: typography.subtitle.lineHeight,
    fontWeight: '600',
  },
  
  body: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontWeight: '400',
  },
  
  caption: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: '400',
  },
  
  button: {
    fontSize: 16,
    lineHeight: 16 * 1.2,
    fontWeight: '600',
  },
  
  // Font weights
  weight_light: { fontWeight: '300' },
  weight_normal: { fontWeight: '400' },
  weight_medium: { fontWeight: '500' },
  weight_semibold: { fontWeight: '600' },
  weight_bold: { fontWeight: '700' },
  
  // Text alignment
  align_left: { textAlign: 'left' },
  align_center: { textAlign: 'center' },
  align_right: { textAlign: 'right' },
});