import { useMemo, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { formatDate } from "@/utils/format";
import { SearchBar, FilterChip, LoadingState, EmptyState, Card } from "@/components/ui";
import { colors, spacing, fontSize } from "@/constants/theme";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const filtered = useMemo(() => {
    let documents = data ?? [];

    if (filter !== "all") {
      const flag = filter === "sales" ? -1 : 1;
      documents = documents.filter((doc) => getDocumentDirection(doc) === flag);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      documents = documents.filter((doc) => {
        const documentNo = (doc?.STK_STOKBASLIK?.belgeserino ?? "").toLowerCase();
        const customerName = (doc?.STK_STOKBASLIK?.unvan ?? "").toLowerCase();
        const belgeno = (doc?.STK_STOKBASLIK?.belgeno ?? "").toLowerCase();
        const docType = getDocumentTypeName(doc).toLowerCase();
        return documentNo.includes(query) || customerName.includes(query) || belgeno.includes(query) || docType.includes(query);
      });
    }

    return documents;
  }, [data, filter, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Belgeler yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ticari İşlemler</Text>
        <Text style={styles.subtitle}>{filtered.length} belge bulundu</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl tintColor={colors.primary[500]} refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Belge ara (no, cari, tip...)"
        />

        <View style={styles.filterRow}>
          {(["all", "sales", "purchases"] as Filter[]).map((item) => (
            <FilterChip
              key={item}
              label={item === "all" ? "Tümü" : item === "sales" ? "Satış" : "Satın Alma"}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="document-outline"
            title="Belge Bulunamadı"
            description={
              searchQuery
                ? "Arama kriterlerinize uygun belge bulunamadı."
                : "Henüz hiçbir işlem kaydı bulunmuyor."
            }
          />
        ) : (
          <View style={styles.documentsList}>
            {filtered.map((doc, index) => {
              const amount = getDocumentAmount(doc) ?? 0;
              const direction = getDocumentDirection(doc);
              const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
              const amountColor =
                direction === -1 ? colors.success[500] : direction === 1 ? colors.error[500] : colors.neutral[400];

              const documentNo = doc?.STK_STOKBASLIK?.belgeserino ?? doc?.belgeserino ?? "Belge";
              const documentDate =
                formatDate(doc?.STK_STOKBASLIK?.belgetarihi ?? doc?.belgetarihi) ?? "Tarih yok";
              const customerName = doc?.STK_STOKBASLIK?.unvan ?? doc?.unvan ?? "Cari bilgisi yok";
              const documentType = getDocumentTypeName(doc);
              const documentDescription = doc?.STK_STOKBASLIK?.aciklama1 ?? doc?.aciklama1;
              const itemCount = doc?.STK_STOKSATIR?.length ?? 0;

              return (
                <TouchableOpacity key={`${doc?.OrkaUQ ?? index}`} activeOpacity={0.7}>
                  <Card variant="elevated" style={styles.documentCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: `${amountColor}15` }]}>
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
                        <Text style={[styles.amount, { color: amountColor }]}>₺{formatted}</Text>
                        <Text style={styles.directionLabel}>
                          {direction === -1 ? "Satış" : direction === 1 ? "Alış" : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardBody}>
                      <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={colors.neutral[500]} />
                        <Text style={styles.infoLabel}>Cari:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {customerName}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.neutral[500]} />
                        <Text style={styles.infoLabel}>Tarih:</Text>
                        <Text style={styles.infoValue}>{documentDate}</Text>
                      </View>

                      {itemCount > 0 && (
                        <View style={styles.infoRow}>
                          <Ionicons name="list-outline" size={16} color={colors.neutral[500]} />
                          <Text style={styles.infoLabel}>Kalem:</Text>
                          <Text style={styles.infoValue}>{itemCount} adet</Text>
                        </View>
                      )}

                      {documentDescription && (
                        <View style={styles.descriptionRow}>
                          <Ionicons name="information-circle-outline" size={16} color={colors.neutral[500]} />
                          <Text style={styles.descriptionText} numberOfLines={2}>
                            {documentDescription}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.neutral[50],
    fontSize: fontSize.xxl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.neutral[400],
    fontSize: fontSize.md,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  documentsList: {
    gap: spacing.md,
  },
  documentCard: {
    padding: 0,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
    color: colors.neutral[50],
    fontSize: fontSize.lg,
    fontWeight: "700",
  },
  documentType: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  directionLabel: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
    marginTop: 2,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.border,
    marginHorizontal: spacing.lg,
  },
  cardBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoLabel: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    fontWeight: "500",
    width: 50,
  },
  infoValue: {
    color: colors.neutral[200],
    fontSize: fontSize.sm,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  descriptionText: {
    color: colors.neutral[300],
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
});
