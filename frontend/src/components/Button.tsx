// Botón reutilizable: principal, secundario o de peligro, con ícono y estado de carga.
import { ActivityIndicator, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean; // Muestra un indicador y bloquea el botón.
  disabled?: boolean;
  small?: boolean;
  grow?: boolean; // Ocupa el espacio disponible dentro de una fila.
};

export default function Button({ label, onPress, variant = "primary", icon, loading = false, disabled = false, small, grow }: Props) {
  const { s, colors } = useTheme();
  const textColor = variant === "secondary" ? colors.accent : variant === "danger" ? "#ffffff" : colors.onAccent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        small && s.buttonSmall,
        grow && s.flex,
        variant === "secondary" && s.buttonSecondary,
        variant === "danger" && s.buttonDanger,
        pressed && s.pressed,
        (disabled || loading) && s.disabled,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
      <Text numberOfLines={1} style={[s.buttonText, { color: textColor }, small && { fontSize: 14 }]}>
        {label}
      </Text>
    </Pressable>
  );
}
