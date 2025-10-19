import { useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { formatDate } from "@/utils/format";

type Filter = "all" | "sales" | "purchases";

function getDocumentTypeName(doc: any): string {
  const belgeTipi = doc?.STK_STOKBASLIK?.belgetipi ?? doc?.belgetipi;
  if (!belgeTipi) return "Belge";

  const tipiStr = String(belgeTipi).toLowerCase();
  if (tipiStr.includes("fatura") || tipiStr.includes("fat")) return "Fatura";
  if (tipiStr.includes("irsaliye") || tipiStr.includes("irs")) return "İrsaliye";
  if (tipiStr.includes("sipariş") || tipiStr.includes("sip")) return "Sipariş";
  if (tipiStr.includes("teklif")) return "Teklif";

  return belgeTipi;
}

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
        <Text style={styles.subtitle}>Tüm belgeler ve faturalar</Text>

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
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#38bdf8" size="large" />
            <Text style={styles.loadingText}>Belgeler yükleniyor...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#475569" />
            <Text style={styles.emptyText}>Belge bulunamadı</Text>
          </View>
        ) : (
          filtered.map((doc, index) => {
            const amount = getDocumentAmount(doc) ?? 0;
            const direction = getDocumentDirection(doc);
            const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
            const amountColor = direction === -1 ? "#4ADE80" : direction === 1 ? "#F87171" : "#E2E8F0";

            const documentNo = doc?.STK_STOKBASLIK?.belgeserino ?? doc?.belgeserino ?? "Belge";
            const documentDate = formatDate(doc?.STK_STOKBASLIK?.belgetarihi ?? doc?.belgetarihi) ?? "Tarih yok";
            const customerName = doc?.STK_STOKBASLIK?.unvan ?? doc?.unvan ?? "Cari bilgisi yok";
            const documentType = getDocumentTypeName(doc);
            const documentDescription = doc?.STK_STOKBASLIK?.aciklama1 ?? doc?.aciklama1;
            const itemCount = doc?.STK_STOKSATIR?.length ?? 0;

            return (
              <View key={`${doc?.OrkaUQ ?? index}`} style={styles.documentCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: direction === -1 ? "#4ADE8015" : "#F8717115" }]}>
                      <Ionicons
                        name={direction === -1 ? "trending-up" : "trending-down"}
                        size={20}
                        color={amountColor}
                      />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.documentNo}>{documentNo}</Text>
                      <Text style={styles.documentType}>{documentType}</Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={[styles.amount, { color: amountColor }]}>₺ {formatted}</Text>
                    <Text style={styles.directionLabel}>
                      {direction === -1 ? "Satış" : direction === 1 ? "Alış" : ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoLabel}>Cari:</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>{customerName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                    <Text style={styles.infoLabel}>Tarih:</Text>
                    <Text style={styles.infoValue}>{documentDate}</Text>
                  </View>

                  {itemCount > 0 && (
                    <View style={styles.infoRow}>
                      <Ionicons name="list-outline" size={16} color="#94A3B8" />
                      <Text style={styles.infoLabel}>Kalem:</Text>
                      <Text style={styles.infoValue}>{itemCount} adet</Text>
                    </View>
                  )}

                  {documentDescription && (
                    <View style={styles.descriptionRow}>
                      <Ionicons name="information-circle-outline" size={16} color="#94A3B8" />
                      <Text style={styles.descriptionText} numberOfLines={2}>{documentDescription}</Text>
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
  filterRow: {
    flexDirection: "row",
    gap: 12,
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
  documentCard: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderText: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  documentNo: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
  },
  documentType: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: "700",
  },
  directionLabel: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
  },
  cardBody: {
    gap: 10,
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
    width: 50,
  },
  infoValue: {
    color: "#E2E8F0",
    fontSize: 13,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  descriptionText: {
    color: "#CBD5E1",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
