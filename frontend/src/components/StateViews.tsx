// Vistas de estado: cargando, lista vacía y error con botón para reintentar.
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";
import Message from "./Message";
import { useTheme } from "../theme/ThemeProvider";

export function Loading({ text = "Cargando…" }: { text?: string }) {
  const { s, colors } = useTheme();
  return (
    <View style={[s.center, { paddingVertical: 40, gap: 12 }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={s.muted}>{text}</Text>
    </View>
  );
}

export function Empty({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) {
  const { s, colors } = useTheme();
  return (
    <View style={[s.card, s.center, { paddingVertical: 32 }]}>
      <Ionicons name={icon} size={40} color={colors.muted} />
      <Text style={[s.h3, { textAlign: "center" }]}>{title}</Text>
      <Text style={[s.muted, { textAlign: "center" }]}>{text}</Text>
    </View>
  );
}

export function ErrorState({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <View style={{ gap: 12 }}>
      <Message type="error" text={text} />
      <Button label="Reintentar" icon="refresh" variant="secondary" onPress={onRetry} />
    </View>
  );
}
