// Fila de dato: etiqueta a la izquierda y valor a la derecha.
import { Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export default function InfoRow({ label, value }: { label: string; value: string }) {
  const { s } = useTheme();
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text selectable style={s.infoValue}>
        {value}
      </Text>
    </View>
  );
}
