// Mensaje visible en pantalla (nunca alert): error, éxito o información.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

type Props = { type: "error" | "success" | "info"; text: string };

export default function Message({ type, text }: Props) {
  const { s, colors } = useTheme();
  const palette = {
    error: { bg: colors.errorSoft, fg: colors.error, icon: "alert-circle" as const },
    success: { bg: colors.successSoft, fg: colors.success, icon: "checkmark-circle" as const },
    info: { bg: colors.accentSoft, fg: colors.accent, icon: "information-circle" as const },
  }[type];
  return (
    <View style={[s.message, { backgroundColor: palette.bg }]}>
      <Ionicons name={palette.icon} size={20} color={palette.fg} />
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.messageText, { color: palette.fg }]}>
        {text}
      </Text>
    </View>
  );
}
