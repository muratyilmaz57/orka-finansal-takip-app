import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { Button, Card } from "@/components/ui";
import { colors, spacing, fontSize } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, logout } = useAuth();

  const handleSwitchCompany = () => {
    router.replace("/(auth)/company");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Hesap bilgileriniz ve ayarlarınız</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={colors.primary[500]} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{state.loginUser?.KullaniciAdi ?? "Kullanıcı"}</Text>
            <Text style={styles.userRole}>Orka Kullanıcısı</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firma Bilgileri</Text>
          <Card>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="business" size={20} color={colors.primary[500]} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Aktif Firma</Text>
                <Text style={styles.infoValue}>
                  {state.selectedCompany?.unvan1 ?? state.selectedCompany?.veritabaniadi ?? "Firma seçilmedi"}
                </Text>
              </View>
            </View>
            {state.selectedCompany?.veritabaniadi && (
              <View style={[styles.infoRow, { marginTop: spacing.lg }]}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="code-working" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Veritabanı Kodu</Text>
                  <Text style={styles.infoValue}>{state.selectedCompany.veritabaniadi}</Text>
                </View>
              </View>
            )}
            {state.selectedCompany?.vergidairesi && (
              <View style={[styles.infoRow, { marginTop: spacing.lg }]}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="document-text" size={20} color={colors.primary[500]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Vergi Dairesi</Text>
                  <Text style={styles.infoValue}>{state.selectedCompany.vergidairesi}</Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <Button
            variant="outline"
            onPress={handleSwitchCompany}
            fullWidth
            icon={<Ionicons name="swap-horizontal" size={20} color={colors.primary[600]} />}
          >
            Firma Değiştir
          </Button>
        </View>
      </View>

      <View style={styles.footer}>
        <Button variant="danger" onPress={handleLogout} fullWidth icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
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
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary[500]}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  userName: {
    color: colors.neutral[50],
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  userRole: {
    color: colors.neutral[400],
    fontSize: fontSize.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.neutral[200],
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.primary[500]}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.neutral[400],
    fontSize: fontSize.sm,
    marginBottom: spacing.xs / 2,
  },
  infoValue: {
    color: colors.neutral[50],
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
});

