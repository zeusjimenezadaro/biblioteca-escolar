// Botón tipo «píldora» para filtros (categorías, estados, roles).
import { Pressable, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

type Props = { label: string; active: boolean; onPress: () => void };

export default function Chip({ label, active, onPress }: Props) {
  const { s } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [s.chip, active && s.chipActive, pressed && s.pressed]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}
