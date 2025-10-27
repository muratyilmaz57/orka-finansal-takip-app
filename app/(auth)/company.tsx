import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { OrkaCompany } from "@/lib/api";
import { Button, Card, EmptyState, ErrorState } from "@/components/ui";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";

export default function CompanySelectionScreen() {
  const router = useRouter();
  const { state, selectCompany, refreshCompanies, logout } = useAuth();
  const [isRefreshing, setRefreshing] = useState(false);
  const [selectingCompany, setSelectingCompany] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (state.status === "loggedOut") {
        router.replace("/(auth)/login");
      }
    }, [router, state.status]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await refreshCompanies();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firma listesi yenilenemedi.";
      setError(message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelect = async (company: OrkaCompany) => {
    try {
      setSelectingCompany(company.veritabaniadi);
      setError(null);
      await selectCompany(company.veritabaniadi);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Firma seçimi başarısız oldu.";
      setError(message);
    } finally {
      setSelectingCompany(null);
    }
  };

  const renderCompany = ({ item }: { item: OrkaCompany }) => {
    const isLoading = selectingCompany === item.veritabaniadi;
    const isSelected = state.selectedCompany?.veritabaniadi === item.veritabaniadi;
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => handleSelect(item)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <Card
          variant="elevated"
          style={[styles.companyCard, isSelected && styles.cardSelected]}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconWrapper}>
              <Ionicons name="business" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{item.unvan1 || item.veritabaniadi}</Text>
              <Text style={styles.companyCode}>{item.veritabaniadi}</Text>
              {item.vergidairesi && (
                <View style={styles.taxRow}>
                  <Ionicons name="document-text-outline" size={14} color={colors.neutral[500]} />
                  <Text style={styles.taxOffice}>{item.vergidairesi}</Text>
                </View>
              )}
            </View>
            <View style={styles.actionContainer}>
              {isLoading ? (
                <ActivityIndicator color={colors.primary[500]} />
              ) : (
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "chevron-forward"}
                  size={24}
                  color={isSelected ? colors.success[500] : colors.neutral[500]}
                />
              )}
            </View>
          </View>
        </Card>
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
            : "Çalışmak istediğiniz firmayı seçin"}
        </Text>
      </View>

      {error && (
        <ErrorState
          message={error}
          onRetry={onRefresh}
          retryLabel="Tekrar Dene"
        />
      )}

      {!error && (
        <FlatList
          data={state.companies}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderCompany}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          contentContainerStyle={state.companies.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="Firma Bulunamadı"
              description="Hesabınıza tanımlı hiçbir firma bulunamadı. Lütfen ORKA admin panelinizden firma tanımlamalarınızı kontrol edin."
              action={
                <Button variant="outline" onPress={onRefresh}>
                  Yenile
                </Button>
              }
            />
          }
        />
      )}

      <View style={styles.footer}>
        <Button variant="ghost" onPress={logout} fullWidth>
          Çıkış Yap
        </Button>
      </View>
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
    paddingTop: spacing.xxxl * 2,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.neutral[50],
    fontSize: fontSize.xxl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.neutral[400],
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  cardContainer: {
    marginBottom: spacing.lg,
  },
  companyCard: {
    padding: 0,
  },
  cardSelected: {
    borderColor: colors.primary[600],
    borderWidth: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  companyInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  companyName: {
    color: colors.neutral[50],
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  companyCode: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
  },
  taxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs / 2,
  },
  taxOffice: {
    color: colors.neutral[500],
    fontSize: fontSize.xs,
  },
  actionContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
});
