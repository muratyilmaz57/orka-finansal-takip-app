import { useMemo } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { buildDashboardSummary, getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TransactionListItem } from "@/components/dashboard/transaction-list-item";
import { LoadingState, EmptyState } from "@/components/ui";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { colors, spacing, fontSize } from "@/constants/theme";

export default function DashboardScreen() {
  const { state } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const summary = useMemo(() => buildDashboardSummary(data ?? []), [data]);
  const lastTransactions = useMemo(() => (data ?? []).slice(0, 5), [data]);

  const monthlyData = useMemo(() => {
    const documents = data ?? [];
    const monthMap = new Map<string, { income: number; expense: number }>();

    documents.forEach((doc) => {
      const date = doc?.STK_STOKBASLIK?.belgetarihi;
      if (!date) return;

      const month = date.slice(0, 7);
      const amount = getDocumentAmount(doc) ?? 0;
      const direction = getDocumentDirection(doc);

      if (!monthMap.has(month)) {
        monthMap.set(month, { income: 0, expense: 0 });
      }

      const monthData = monthMap.get(month)!;
      if (direction === -1) {
        monthData.income += amount;
      } else if (direction === 1) {
        monthData.expense += amount;
      }
    });

    const sortedMonths = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return {
      income: sortedMonths.map(([month, data]) => ({
        x: month.slice(5),
        y: data.income,
      })),
      expense: sortedMonths.map(([month, data]) => ({
        x: month.slice(5),
        y: data.expense,
      })),
    };
  }, [data]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Finansal veriler yükleniy or..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary[500]}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>
              {state.selectedCompany?.unvan1 || state.selectedCompany?.veritabaniadi || "Firma seçilmedi"}
            </Text>
            <Text style={styles.subHeading}>Finansal Özetiniz</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Toplam Gelir"
            value={`₺${summary.totalSales.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
            icon="trending-up"
            variant="success"
          />
          <MetricCard
            label="Toplam Gider"
            value={`₺${summary.totalPurchases.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
            icon="trending-down"
            variant="error"
          />
          <MetricCard
            label="Net Kar"
            value={`₺${summary.profit.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`}
            icon="cash"
            variant={summary.profit >= 0 ? "success" : "error"}
          />
          <MetricCard
            label="İşlem Sayısı"
            value={summary.transactionCount.toString()}
            icon="document-text"
            variant="default"
          />
        </View>

        {monthlyData.income.length > 0 && (
          <View style={styles.section}>
            <LineChart
              data={monthlyData.income}
              title="Aylık Gelir Trendi"
              color={colors.success[500]}
              height={220}
            />
          </View>
        )}

        {monthlyData.expense.length > 0 && (
          <View style={styles.section}>
            <BarChart
              data={monthlyData.expense}
              title="Aylık Gider Dağılımı"
              color={colors.error[500]}
              height={220}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          {lastTransactions.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="İşlem Bulunamadı"
              description="Henüz hiçbir işlem kaydı bulunmuyor."
            />
          ) : (
            <View style={styles.transactionsList}>
              {lastTransactions.map((transaction, index) => {
                const amount = getDocumentAmount(transaction) ?? 0;
                const direction = getDocumentDirection(transaction);
                const formatted = `₺${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
                const type = direction === -1 ? "income" : direction === 1 ? "expense" : "neutral";
                const title = `#${transaction?.STK_STOKBASLIK?.belgeno ?? "-"}`;
                const subtitle = `${transaction?.STK_STOKBASLIK?.belgeserino ?? "Belge"} · ${
                  transaction?.STK_STOKBASLIK?.belgetarihi?.slice(0, 10) ?? "Tarih yok"
                }`;

                return (
                  <TransactionListItem
                    key={`${transaction?.OrkaUQ ?? index}`}
                    title={title}
                    subtitle={subtitle}
                    amount={formatted}
                    type={type}
                    icon={direction === -1 ? "arrow-up-circle" : "arrow-down-circle"}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heading: {
    color: colors.neutral[50],
    fontSize: fontSize.xxl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subHeading: {
    color: colors.neutral[400],
    fontSize: fontSize.md,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  section: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    color: colors.neutral[200],
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  transactionsList: {
    gap: spacing.md,
  },
});
