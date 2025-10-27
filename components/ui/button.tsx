import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`${size}Size`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[600] : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
  },
  secondary: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary[600],
    borderRadius: borderRadius.md,
  },
  danger: {
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.md,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
  },
  smSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mdSize: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lgSize: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: colors.primary[600],
  },
  dangerText: {
    color: '#FFFFFF',
  },
  ghostText: {
    color: colors.neutral[300],
  },
  smText: {
    fontSize: fontSize.sm,
  },
  mdText: {
    fontSize: fontSize.md,
  },
  lgText: {
    fontSize: fontSize.lg,
  },
});
