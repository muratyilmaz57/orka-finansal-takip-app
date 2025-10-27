import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/constants/theme';

type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

export function Badge({ variant = 'neutral', size = 'md', children, style, ...props }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`${size}Size`], style]} {...props}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  primary: {
    backgroundColor: `${colors.primary[500]}20`,
  },
  success: {
    backgroundColor: `${colors.success[500]}20`,
  },
  error: {
    backgroundColor: `${colors.error[500]}20`,
  },
  warning: {
    backgroundColor: `${colors.warning[500]}20`,
  },
  neutral: {
    backgroundColor: colors.neutral[800],
  },
  smSize: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  mdSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: colors.primary[400],
  },
  successText: {
    color: colors.success[400],
  },
  errorText: {
    color: colors.error[400],
  },
  warningText: {
    color: colors.warning[400],
  },
  neutralText: {
    color: colors.neutral[300],
  },
  smText: {
    fontSize: fontSize.xs,
  },
  mdText: {
    fontSize: fontSize.sm,
  },
});
