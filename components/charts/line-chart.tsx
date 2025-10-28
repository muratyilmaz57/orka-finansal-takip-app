import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { colors, spacing, fontSize } from '@/constants/theme';

interface LineChartProps {
  data: { x: string | number; y: number }[];
  title?: string;
  color?: string;
  height?: number;
}

const screenWidth = Dimensions.get('window').width;

export function LineChart({ data, title, color = colors.primary[500], height = 200 }: LineChartProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <VictoryChart
        width={screenWidth - spacing.xl * 2}
        height={height}
        theme={VictoryTheme.material}
        padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: colors.dark.border },
            tickLabels: { fill: colors.neutral[400], fontSize: 10 },
            grid: { stroke: colors.dark.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: colors.dark.border },
            tickLabels: { fill: colors.neutral[400], fontSize: 10 },
            grid: { stroke: colors.dark.border, strokeDasharray: '4,4' },
          }}
        />
        <VictoryLine
          data={data}
          style={{
            data: { stroke: color, strokeWidth: 3 },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      </VictoryChart>
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
  },
  title: {
    color: colors.neutral[200],
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
});
