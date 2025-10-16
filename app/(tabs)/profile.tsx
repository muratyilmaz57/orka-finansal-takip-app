import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/context/AuthContext";

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
      <View style={styles.section}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Bağlı Kullanıcı</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Kullanıcı</Text>
          <Text style={styles.infoValue}>{state.loginUser?.KullaniciAdi ?? "Bilinmiyor"}</Text>

          <Text style={[styles.infoLabel, { marginTop: 16 }]}>Firma</Text>
          <Text style={styles.infoValue}>
            {state.selectedCompany?.unvan1 ?? state.selectedCompany?.veritabaniadi ?? "Firma seçilmedi"}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchCompany}>
          <Text style={styles.secondaryButtonText}>Firma Değiştir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
          <Text style={styles.dangerButtonText}>Çıkış yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    padding: 20,
  },
  section: {
    gap: 16,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94A3B8",
  },
  infoCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  infoLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    color: "#F8FAFC",
    fontSize: 18,
    marginTop: 4,
    fontWeight: "600",
  },
  actions: {
    marginTop: "auto",
    gap: 12,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2563EB",
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#60A5FA",
    fontWeight: "600",
  },
  dangerButton: {
    borderRadius: 12,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});

