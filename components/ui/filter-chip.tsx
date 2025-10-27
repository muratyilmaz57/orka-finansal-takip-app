import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, borderRadius, spacing, fontSize } from '@/constants/theme';

interface FilterChipProps extends TouchableOpacityProps {
  label: string;
  selected?: boolean;
}

export function FilterChip({ label, selected = false, ...props }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  chipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  label: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  labelSelected: {
    color: colors.neutral[50],
  },
});
