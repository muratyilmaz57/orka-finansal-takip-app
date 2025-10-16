import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useReceiptsQuery } from "@/hooks/useOrkaQueries";
import { formatDate } from "@/utils/format";
import { parseAmount } from "@/utils/number";

export default function AccountingScreen() {
  const { data, isLoading, isRefetching, refetch } = useReceiptsQuery({ Page: 1 });
  const receipts = data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor="#fff" refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text style={styles.title}>Muhasebe Fişleri</Text>
        <Text style={styles.subtitle}>Son fiş kayıtları</Text>

        {isLoading && <Text style={styles.placeholder}>Yükleniyor...</Text>}

        {!isLoading &&
          receipts.map((item, index) => (
            <View key={`${item?.fisGuid ?? index}`} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item?.fisNo ?? item?.FisNo ?? "Fiş"}</Text>
                <Text style={styles.cardMeta}>
                  {formatDate(item?.fisTarihi ?? item?.FisTarihi) ?? "Tarih yok"} · {item?.fisTipi ?? item?.FisTipi ?? ""}
                </Text>
                {item?.fisaciklama ?? item?.FisAciklama ? (
                  <Text style={styles.cardDescription}>{item?.fisaciklama ?? item?.FisAciklama}</Text>
                ) : null}
              </View>
              <Text style={styles.amount}>₺ {extractReceiptAmount(item).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</Text>
            </View>
          ))}
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
  subtitle: {
    color: "#94A3B8",
  },
  placeholder: {
    color: "#94A3B8",
  },
  card: {
    backgroundColor: "#151C2C",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 16,
  },
  cardMeta: {
    color: "#94A3B8",
    fontSize: 13,
  },
  cardDescription: {
    color: "#CBD5F5",
    marginTop: 4,
  },
  amount: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 12,
  },
});

function extractReceiptAmount(record: any): number {
  const candidates = [
    record?.toplamBorc,
    record?.toplamAlacak,
    record?.genelToplam,
    record?.fisTutari,
    record?.borcToplam,
    record?.alacakToplam,
  ];
  for (const candidate of candidates) {
    const parsed = parseAmount(candidate);
    if (parsed !== null && parsed !== 0) {
      return parsed;
    }
  }
  const entries = Object.entries(record ?? {});
  for (const [key, value] of entries) {
    const lower = key.toLowerCase();
    if (!/(toplam|tutar|borc|alacak)/.test(lower)) continue;
    if (/kod|no|tip/.test(lower)) continue;
    const parsed = parseAmount(value);
    if (parsed !== null && parsed !== 0) {
      return parsed;
    }
  }
  return 0;
}
