import { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { formatDate } from "@/utils/format";

type InvoiceType = "all" | "sales" | "purchase";

export default function InvoicesScreen() {
  const [filter, setFilter] = useState<InvoiceType>("all");
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const invoices = useMemo(() => {
    const documents = data ?? [];

    if (filter === "all") {
      return documents.slice(0, 10);
    }

    const direction = filter === "sales" ? -1 : 1;
    const filtered = documents.filter((doc) => getDocumentDirection(doc) === direction);
    return filtered.slice(0, 10);
  }, [data, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text style={styles.title}>E-Belgeler</Text>
        <Text style={styles.subtitle}>Son 10 Fatura</Text>
        {!isLoading && data && (
          <Text style={styles.debugText}>
            Toplam {data.length} belge, gösterilen {invoices.length} fatura
          </Text>
        )}

        <View style={styles.filterRow}>
          {(["all", "sales", "purchase"] as InvoiceType[]).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item === "all" ? "Tümü" : item === "sales" ? "Satış Faturası" : "Alış Faturası"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#38bdf8" size="large" />
            <Text style={styles.loadingText}>Faturalar yükleniyor...</Text>
          </View>
        ) : invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>Fatura bulunamadı</Text>
          </View>
        ) : (
          invoices.map((doc, index) => {
            const amount = getDocumentAmount(doc) ?? 0;
            const direction = getDocumentDirection(doc);
            const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
            const invoiceNo = doc?.STK_STOKBASLIK?.belgeserino ?? doc?.belgeserino ?? "Belge";
            const invoiceDate = formatDate(doc?.STK_STOKBASLIK?.belgetarihi ?? doc?.belgetarihi) ?? "Tarih yok";
            const customerName = doc?.STK_STOKBASLIK?.unvan ?? doc?.unvan ?? "Müşteri bilgisi yok";
            const documentType = direction === -1 ? "Satış Faturası" : direction === 1 ? "Alış Faturası" : "Belge";
            const amountColor = direction === -1 ? "#4ADE80" : direction === 1 ? "#F87171" : "#E2E8F0";

            return (
              <View key={`${doc?.OrkaUQ ?? index}`} style={styles.invoiceCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons
                      name={direction === -1 ? "arrow-up-circle" : "arrow-down-circle"}
                      size={24}
                      color={amountColor}
                    />
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.invoiceNo}>{invoiceNo}</Text>
                      <Text style={styles.documentType}>{documentType}</Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={[styles.amount, { color: amountColor }]}>₺ {formatted}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoLabel}>Müşteri:</Text>
                    <Text style={styles.infoValue}>{customerName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoLabel}>Tarih:</Text>
                    <Text style={styles.infoValue}>{invoiceDate}</Text>
                  </View>

                  {doc?.STK_STOKBASLIK?.aciklama1 && (
                    <View style={styles.infoRow}>
                      <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
                      <Text style={styles.infoLabel}>Açıklama:</Text>
                      <Text style={styles.infoValue}>{doc.STK_STOKBASLIK.aciklama1}</Text>
                    </View>
                  )}
                </View>
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
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94A3B8",
    fontSize: 14,
  },
  debugText: {
    color: "#64748B",
    fontSize: 12,
    fontStyle: "italic",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
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
    fontSize: 13,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 16,
  },
  invoiceCard: {
    backgroundColor: "#151C2C",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  invoiceNo: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "700",
  },
  documentType: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    color: "#E2E8F0",
    fontSize: 13,
    flex: 1,
  },
});
