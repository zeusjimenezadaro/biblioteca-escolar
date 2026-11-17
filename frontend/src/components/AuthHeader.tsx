// Encabezado de las pantallas de login y registro: logo, nombre y frase.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

export default function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { s } = useTheme();
  return (
    <View style={[s.hero, { alignItems: "center", paddingVertical: 28 }]}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="library" size={34} color="#ffffff" />
      </View>
      <Text style={[s.heroText, { fontWeight: "800", letterSpacing: 1.2 }]}>BIBLIOTECA ESCOLAR</Text>
      <Text accessibilityRole="header" style={[s.heroTitle, { textAlign: "center" }]}>
        {title}
      </Text>
      <Text style={[s.heroText, { textAlign: "center" }]}>{subtitle}</Text>
    </View>
  );
}
