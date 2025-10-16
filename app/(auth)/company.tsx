import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { OrkaCompany } from "@/lib/api";
import { colors } from "@/theme/colors";

export default function CompanySelectionScreen() {
  const router = useRouter();
  const { state, selectCompany, refreshCompanies, logout } = useAuth();
  const [isRefreshing, setRefreshing] = useState(false);
  const [selectingCompany, setSelectingCompany] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (state.status === "loggedOut") {
        router.replace("/(auth)/login");
      }
    }, [router, state.status]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCompanies();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firma listesi yenilenemedi.";
      Alert.alert("Hata", message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelect = async (company: OrkaCompany) => {
    try {
      setSelectingCompany(company.veritabaniadi);
      await selectCompany(company.veritabaniadi);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firma seçimi başarısız oldu.";
      Alert.alert("Hata", message);
    } finally {
      setSelectingCompany(null);
    }
  };

  const renderCompany = ({ item }: { item: OrkaCompany }) => {
    const isLoading = selectingCompany === item.veritabaniadi;
    const isSelected = state.selectedCompany?.veritabaniadi === item.veritabaniadi;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleSelect(item)}
        disabled={isLoading}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName}>{item.unvan1 || item.veritabaniadi}</Text>
          <Text style={styles.companyCode}>{item.veritabaniadi}</Text>
          {item.vergidairesi ? <Text style={styles.taxOffice}>VD: {item.vergidairesi}</Text> : null}
        </View>
        {isLoading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.actionLabel}>Seç</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firma Seçimi</Text>
        <Text style={styles.description}>
          {state.companies.length === 0
            ? "Hesabınıza tanımlı firma bulunamadı."
            : "Çalışmak istediğiniz firmayı seçin."}
        </Text>
      </View>

      <FlatList
        data={state.companies}
        keyExtractor={(item) => String(item.ID)}
        renderItem={renderCompany}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={state.companies.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.emptyText}>Firma listesi çekiliyor...</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    color: "#94A3B8",
    marginTop: 6,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#151C2C",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
    flexDirection: "row",
    alignItems: "center",
  },
  cardSelected: {
    borderColor: "#38BDF8",
  },
  companyName: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
  companyCode: {
    color: "#94A3B8",
    marginTop: 4,
  },
  taxOffice: {
    color: "#64748B",
    marginTop: 2,
  },
  actionLabel: {
    color: colors.primary,
    fontWeight: "700",
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 32,
  },
  logoutText: {
    color: "#E2E8F0",
    fontWeight: "600",
  },
});
