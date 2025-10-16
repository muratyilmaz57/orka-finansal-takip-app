import { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { formatDate } from "@/utils/format";

type Filter = "all" | "sales" | "purchases";

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const filtered = useMemo(() => {
    const documents = data ?? [];
    if (filter === "all") return documents;
    const flag = filter === "sales" ? -1 : 1;
    return documents.filter((doc) => getDocumentDirection(doc) === flag);
  }, [data, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text style={styles.title}>Ticari İşlemler</Text>
        <View style={styles.filterRow}>
          {(["all", "sales", "purchases"] as Filter[]).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item === "all" ? "Tümü" : item === "sales" ? "Satış" : "Satın Alma"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {isLoading ? (
          <ActivityIndicator color="#38bdf8" />
        ) : (
          filtered.map((doc, index) => {
            const amount = getDocumentAmount(doc) ?? 0;
            const direction = getDocumentDirection(doc);
            const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
            const amountColor = direction === -1 ? "#4ADE80" : direction === 1 ? "#F87171" : "#E2E8F0";
            return (
              <View key={`${doc?.OrkaUQ ?? index}`} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{doc?.STK_STOKBASLIK?.belgeserino ?? "Belge"}</Text>
                  <Text style={styles.itemSub}>
                    {formatDate(doc?.STK_STOKBASLIK?.belgetarihi) ?? "Tarih yok"}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: amountColor }]}>₺ {formatted}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  filterChipActive: {
    backgroundColor: "#1d4ed8",
    borderColor: "#2563eb",
  },
  filterText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  itemCard: {
    backgroundColor: "#151C2C",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
  },
  itemSub: {
    color: "#94A3B8",
    marginTop: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
