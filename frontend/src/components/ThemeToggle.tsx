// Botón de la barra superior para cambiar entre modo claro y oscuro.
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

export default function ThemeToggle() {
  const { s, isDark, toggle } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      onPress={toggle}
      hitSlop={10}
      style={({ pressed }) => [{ paddingHorizontal: 8 }, pressed && s.pressed]}
    >
      <Ionicons name={isDark ? "sunny" : "moon"} size={22} color="#ffffff" />
    </Pressable>
  );
}
