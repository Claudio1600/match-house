import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Button";
import { colors, radius, spacing, typography } from "../../utils/theme";

export default function VerifyEmailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || user?.email || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    const newCode = [...code];
    // Only keep last char if paste-like input
    const char = value.slice(-1);
    newCode[index] = char;
    setCode(newCode);

    // Auto-advance
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      Alert.alert("Codice incompleto", "Inserisci il codice a 6 cifre");
      return;
    }
    if (!email) {
      Alert.alert("Errore", "Email non trovata, torna alla registrazione");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail({ email, otp: fullCode });
      Alert.alert(
        "Email verificata!",
        "Accedi per continuare.",
        [{ text: "Accedi", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch {
      Alert.alert("Codice errato", "Verifica il codice e riprova");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(email);
      Alert.alert("Email inviata", "Controlla la tua casella di posta");
    } catch {
      Alert.alert("Errore", "Non è stato possibile inviare il codice");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Verifica l'email</Text>
          <Text style={styles.subtitle}>
            Abbiamo inviato un codice a 6 cifre a{"\n"}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputs.current[i] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <Button
            label="Verifica"
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyButton}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Non hai ricevuto il codice?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.resendLink}>
                {resendLoading ? "Invio..." : "Reinvia"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    alignItems: "center",
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    alignSelf: "flex-start",
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    alignSelf: "flex-start",
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  email: {
    color: colors.textPrimary,
    fontWeight: "500",
  },
  codeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontSize: 22,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
  },
  codeInputFilled: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  verifyButton: {
    width: "100%",
  },
  resendRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xl,
    alignItems: "center",
  },
  resendText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  resendLink: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
