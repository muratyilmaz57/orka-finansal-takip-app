import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { VictoryPie } from 'victory-native';
import { colors, spacing, fontSize } from '@/constants/theme';

interface PieChartProps {
  data: { x: string; y: number }[];
  title?: string;
  colorScale?: string[];
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export function PieChart({
  data,
  title,
  colorScale = [colors.primary[500], colors.success[500], colors.warning[500], colors.error[500]],
  height = 250,
}: PieChartProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <VictoryPie
        data={data}
        width={screenWidth - spacing.xl * 2}
        height={height}
        colorScale={colorScale}
        style={{
          labels: { fill: colors.neutral[50], fontSize: 12, fontWeight: '600' },
        }}
        animate={{
          duration: 1000,
          onLoad: { duration: 500 },
        }}
        labelRadius={({ innerRadius }) => (innerRadius as number) + 30}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  title: {
    color: colors.neutral[200],
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
});
