import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "@/components/ui";
import { ErrorState } from "@/components/ui/error-state";
import { colors, spacing, fontSize } from "@/constants/theme";

const DEFAULT_YEAR = 2025;

export default function LoginScreen() {
  const router = useRouter();
  const { login, state } = useAuth();
  const [apiKey, setApiKey] = useState<string>(
    (Constants.expoConfig?.extra?.orkaApiKey as string | undefined) ?? "",
  );
  const [year, setYear] = useState<string>(String(DEFAULT_YEAR));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError("Lütfen ORKA API anahtarınızı girin.");
      return;
    }
    const parsedYear = Number(year) || DEFAULT_YEAR;
    try {
      setError(null);
      setLoading(true);
      await login({ apiKey, companyYear: parsedYear });
      router.replace("/(auth)/company");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Giriş başarısız oldu. Lütfen API anahtarınızı kontrol edin.";
      setError(message);
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
      <View style={styles.header}>
        <Text style={styles.title}>Orka Finansal Takip</Text>
        <Text style={styles.subtitle}>API anahtarınızla güvenli giriş yapın</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="API Anahtarı"
          value={apiKey}
          onChangeText={(text) => {
            setApiKey(text);
            setError(null);
          }}
          placeholder="D-E-M-O"
          autoCapitalize="characters"
          autoCorrect={false}
          error={error && !apiKey.trim() ? "API anahtarı gereklidir" : undefined}
        />

        <Input
          label="Bilanço Yılı"
          value={year}
          onChangeText={setYear}
          placeholder="2025"
          keyboardType="numeric"
          helperText="Çalışmak istediğiniz bilanço yılını girin"
        />

        {error && (
          <View style={styles.errorContainer}>
            <ErrorState
              message={error}
              onRetry={() => setError(null)}
              retryLabel="Tamam"
            />
          </View>
        )}

        <Button
          disabled={loading}
          loading={loading}
          onPress={handleLogin}
          fullWidth
          size="lg"
          style={styles.submitButton}
        >
          Giriş Yap
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.xxxl * 3,
    marginBottom: spacing.xxxl,
  },
  title: {
    color: colors.neutral[50],
    fontSize: fontSize.xxxl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.neutral[400],
    fontSize: fontSize.lg,
    lineHeight: 24,
  },
  form: {
    gap: spacing.xl,
  },
  errorContainer: {
    marginVertical: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
