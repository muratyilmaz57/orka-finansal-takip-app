import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";

const DEFAULT_YEAR = 2025;

export default function LoginScreen() {
  const router = useRouter();
  const { login, state } = useAuth();
  const [apiKey, setApiKey] = useState<string>(
    (Constants.expoConfig?.extra?.orkaApiKey as string | undefined) ?? "",
  );
  const [year, setYear] = useState<string>(String(DEFAULT_YEAR));
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!apiKey) {
      Alert.alert("API anahtarı gerekli", "Lütfen ORKA API anahtarınızı girin.");
      return;
    }
    const parsedYear = Number(year) || DEFAULT_YEAR;
    try {
      setLoading(true);
      await login({ apiKey, companyYear: parsedYear });
      router.replace("/(auth)/company");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Giriş başarısız oldu.";
      Alert.alert("Giriş başarısız", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.status === "companySelected") {
      router.replace("/(tabs)/dashboard");
    } else if (state.status === "loggedIn") {
      router.replace("/(auth)/company");
    }
  }, [router, state.status]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Orka Finansal Takip</Text>
      <Text style={styles.subtitle}>API anahtarınızla giriş yapın</Text>

      <Text style={styles.inputLabel}>API Key</Text>
      <TextInput
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="D-E-M-O"
        autoCapitalize="characters"
        autoCorrect={false}
        style={styles.input}
      />

      <Text style={styles.inputLabel}>Bilanço Yılı</Text>
      <TextInput
        value={year}
        onChangeText={setYear}
        placeholder="2025"
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity disabled={loading} onPress={handleLogin} style={[styles.button, loading && styles.buttonDisabled]}>
        <Text style={styles.buttonText}>{loading ? "Bağlanıyor..." : "Giriş Yap"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    backgroundColor: "#0B1120",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9BA4B5",
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  inputLabel: {
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1C2233",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#293147",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
