import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { colors, spacing, fontSize } from '@/constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'error' | 'warning';
}

export function MetricCard({ label, value, icon, trend, variant = 'default' }: MetricCardProps) {
  const variantColors = {
    default: colors.primary[500],
    success: colors.success[500],
    error: colors.error[500],
    warning: colors.warning[500],
  };

  const iconColor = variantColors[variant];
  const iconBg = `${iconColor}15`;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? colors.success[500] : colors.error[500]}
            />
            <Text style={[
              styles.trendText,
              { color: trend.isPositive ? colors.success[500] : colors.error[500] }
            ]}>
              {trend.value}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trendText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  label: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.neutral[50],
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
});
