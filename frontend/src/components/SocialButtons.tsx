// Botones «Continuar con Google / GitHub / Discord». Solo muestra las redes configuradas en el servidor.
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import type { Provider } from "../types";

const INFO: Record<Provider, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  google: { label: "Google", icon: "logo-google", color: "#ea4335" },
  github: { label: "GitHub", icon: "logo-github", color: "#24292f" },
  discord: { label: "Discord", icon: "logo-discord", color: "#5865f2" },
};

type Props = { onError: (message: string) => void; disabled?: boolean };

export default function SocialButtons({ onError, disabled }: Props) {
  const { s, colors, isDark } = useTheme();
  const { loginWithProvider } = useAuth();
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [busy, setBusy] = useState<Provider | null>(null); // Red que se está usando.

  // Pregunta al servidor qué redes están disponibles.
  useEffect(() => {
    authService
      .providers()
      .then((r) => setProviders(r.providers))
      .catch(() => setProviders([]));
  }, []);

  async function start(provider: Provider) {
    setBusy(provider);
    try {
      await loginWithProvider(provider);
    } catch (error) {
      onError(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(null);
    }
  }

  if (providers === null) return <ActivityIndicator color={colors.accent} />;
  if (!providers.length) return <Text style={[s.small, { textAlign: "center" }]}>El ingreso con redes sociales no está disponible.</Text>;

  return (
    <View style={{ gap: 10 }}>
      {providers.map((p) => {
        const info = INFO[p];
        // El logo de GitHub es negro: en modo oscuro se muestra blanco para que se vea.
        const iconColor = p === "github" && isDark ? "#ffffff" : info.color;
        return (
          <Pressable
            key={p}
            accessibilityRole="button"
            accessibilityLabel={`Continuar con ${info.label}`}
            disabled={disabled || busy !== null}
            onPress={() => start(p)}
            style={({ pressed }) => [
              s.button,
              { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
              pressed && s.pressed,
              (disabled || (busy !== null && busy !== p)) && s.disabled,
            ]}
          >
            {busy === p ? <ActivityIndicator color={iconColor} /> : <Ionicons name={info.icon} size={20} color={iconColor} />}
            <Text style={[s.buttonText, { color: colors.ink }]}>Continuar con {info.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
