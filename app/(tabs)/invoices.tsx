import { useMemo, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useDocumentsQuery } from "@/hooks/useOrkaQueries";
import { getDocumentAmount, getDocumentDirection } from "@/utils/dashboard";
import { formatDate } from "@/utils/format";
import { SearchBar, FilterChip, LoadingState, EmptyState, Card } from "@/components/ui";
import { colors, spacing, fontSize } from "@/constants/theme";

type InvoiceType = "all" | "sales" | "purchase";

export default function InvoicesScreen() {
  const [filter, setFilter] = useState<InvoiceType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isRefetching, refetch } = useDocumentsQuery({ Page: 1 });

  const invoices = useMemo(() => {
    let documents = data ?? [];

    if (filter !== "all") {
      const direction = filter === "sales" ? -1 : 1;
      documents = documents.filter((doc) => getDocumentDirection(doc) === direction);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      documents = documents.filter((doc) => {
        const invoiceNo = (doc?.STK_STOKBASLIK?.belgeserino ?? "").toLowerCase();
        const customerName = (doc?.STK_STOKBASLIK?.unvan ?? "").toLowerCase();
        const belgeno = (doc?.STK_STOKBASLIK?.belgeno ?? "").toLowerCase();
        return invoiceNo.includes(query) || customerName.includes(query) || belgeno.includes(query);
      });
    }

    return documents;
  }, [data, filter, searchQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState message="Faturalar yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>E-Belgeler</Text>
        <Text style={styles.subtitle}>{invoices.length} fatura bulundu</Text>
      </View>

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
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Fatura ara (no, müşteri...)"
        />

        <View style={styles.filterRow}>
          {(["all", "sales", "purchase"] as InvoiceType[]).map((item) => (
            <FilterChip
              key={item}
              label={item === "all" ? "Tümü" : item === "sales" ? "Satış" : "Alış"}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </View>

        {invoices.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="Fatura Bulunamadı"
            description={
              searchQuery
                ? "Arama kriterlerinize uygun fatura bulunamadı."
                : "Henüz hiçbir fatura kaydı bulunmuyor."
            }
          />
        ) : (
          <View style={styles.invoicesList}>
            {invoices.map((doc, index) => {
              const amount = getDocumentAmount(doc) ?? 0;
              const direction = getDocumentDirection(doc);
              const formatted = amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
              const invoiceNo = doc?.STK_STOKBASLIK?.belgeserino ?? doc?.belgeserino ?? "Belge";
              const invoiceDate = formatDate(doc?.STK_STOKBASLIK?.belgetarihi ?? doc?.belgetarihi) ?? "Tarih yok";
              const customerName = doc?.STK_STOKBASLIK?.unvan ?? doc?.unvan ?? "Müşteri bilgisi yok";
              const documentType = direction === -1 ? "Satış Faturası" : direction === 1 ? "Alış Faturası" : "Belge";
              const amountColor = direction === -1 ? colors.success[500] : direction === 1 ? colors.error[500] : colors.neutral[400];

              return (
                <TouchableOpacity
                  key={`${doc?.OrkaUQ ?? index}`}
                  activeOpacity={0.7}
                >
                  <Card variant="elevated" style={styles.invoiceCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: `${amountColor}15` }]}>
                          <Ionicons
                            name={direction === -1 ? "arrow-up" : "arrow-down"}
                            size={20}
                            color={amountColor}
                          />
                        </View>
                        <View style={styles.cardHeaderText}>
                          <Text style={styles.invoiceNo}>{invoiceNo}</Text>
                          <Text style={styles.documentType}>{documentType}</Text>
                        </View>
                      </View>
                      <View style={styles.cardHeaderRight}>
                        <Text style={[styles.amount, { color: amountColor }]}>₺{formatted}</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.cardBody}>
                      <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={colors.neutral[500]} />
                        <Text style={styles.infoLabel}>Müşteri:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {customerName}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.neutral[500]} />
                        <Text style={styles.infoLabel}>Tarih:</Text>
                        <Text style={styles.infoValue}>{invoiceDate}</Text>
                      </View>

                      {doc?.STK_STOKBASLIK?.aciklama1 && (
                        <View style={styles.infoRow}>
                          <Ionicons name="information-circle-outline" size={16} color={colors.neutral[500]} />
                          <Text style={styles.infoLabel}>Açıklama:</Text>
                          <Text style={styles.infoValue} numberOfLines={2}>
                            {doc.STK_STOKBASLIK.aciklama1}
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
  invoicesList: {
    gap: spacing.md,
  },
  invoiceCard: {
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
  invoiceNo: {
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
    width: 70,
  },
  infoValue: {
    color: colors.neutral[200],
    fontSize: fontSize.sm,
    flex: 1,
  },
});
