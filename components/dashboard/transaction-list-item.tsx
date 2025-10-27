import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';

interface TransactionListItemProps {
  title: string;
  subtitle: string;
  amount: string;
  type: 'income' | 'expense' | 'neutral';
  icon?: keyof typeof Ionicons.glyphMap;
}

export function TransactionListItem({
  title,
  subtitle,
  amount,
  type,
  icon = 'document-text',
}: TransactionListItemProps) {
  const typeConfig = {
    income: {
      color: colors.success[500],
      bg: `${colors.success[500]}15`,
      icon: icon,
    },
    expense: {
      color: colors.error[500],
      bg: `${colors.error[500]}15`,
      icon: icon,
    },
    neutral: {
      color: colors.neutral[400],
      bg: colors.neutral[800],
      icon: icon,
    },
  };

  const config = typeConfig[type];

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Text style={[styles.amount, { color: config.color }]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    color: colors.neutral[100],
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.neutral[500],
    fontSize: fontSize.sm,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
