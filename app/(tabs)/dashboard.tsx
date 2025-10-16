import { useMemo } from "react";
import {
  ActivityIndicator,
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

export default function DashboardScreen() {
  const { state } = useAuth();
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const summary = useMemo(() => buildDashboardSummary(data ?? []), [data]);
  const lastTransactions = useMemo(() => (data ?? []).slice(0, 5), [data]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text style={styles.heading}>
          {state.selectedCompany?.unvan1 || state.selectedCompany?.veritabaniadi || "Firma seçilmedi"}
        </Text>
        <Text style={styles.subHeading}>Finansal Özet</Text>

        <View style={styles.cardsRow}>
          <MetricCard label="Gelir" value={summary.totalSales} />
          <MetricCard label="Gider" value={summary.totalPurchases} />
        </View>

        <View style={styles.cardsRow}>
          <MetricCard label="Kar" value={summary.profit} highlight />
          <MetricCard label="İşlem" value={summary.transactionCount} isInt />
        </View>

        <Text style={styles.sectionTitle}>Son İşlemler</Text>
        {isLoading ? (
          <ActivityIndicator color="#4ADE80" />
        ) : (
          lastTransactions.map((transaction, index) => {
            const amount = getDocumentAmount(transaction) ?? 0;
            const direction = getDocumentDirection(transaction);
            const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
            const amountColor = direction === -1 ? "#4ADE80" : direction === 1 ? "#F87171" : "#E2E8F0";
            return (
              <View key={`${transaction?.OrkaUQ ?? index}`} style={styles.transactionCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transactionTitle}>#{transaction?.STK_STOKBASLIK?.belgeno ?? "-"}</Text>
                  <Text style={styles.transactionSub}>
                    {transaction?.STK_STOKBASLIK?.belgeserino ?? "Belge"} ·{" "}
                    {transaction?.STK_STOKBASLIK?.belgetarihi?.slice(0, 10) ?? "Tarih yok"}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: amountColor }]}>₺ {formatted}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type MetricProps = {
  label: string;
  value: number;
  highlight?: boolean;
  isInt?: boolean;
};

function MetricCard({ label, value, highlight, isInt }: MetricProps) {
  const display = isInt ? value.toString() : `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺`;
  return (
    <View style={[styles.metricCard, highlight && styles.metricCardHighlight]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  content: {
    padding: 20,
    gap: 18,
  },
  heading: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
  },
  subHeading: {
    color: "#94A3B8",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#151C2C",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  metricCardHighlight: {
    borderColor: "#22C55E",
  },
  metricLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },
  metricValue: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  sectionTitle: {
    color: "#CBD5F5",
    fontWeight: "600",
    marginTop: 12,
  },
  transactionCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionTitle: {
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionSub: {
    color: "#94A3B8",
  },
  transactionAmount: {
    fontWeight: "700",
    fontSize: 16,
  },
});
