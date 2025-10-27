import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, borderRadius, spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({ variant = 'default', style, children, ...props }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  default: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.dark.borderLight,
  },
  elevated: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
