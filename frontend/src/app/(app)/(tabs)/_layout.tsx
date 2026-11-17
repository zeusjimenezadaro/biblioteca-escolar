// Barra de pestañas inferior. La pestaña «Usuarios» solo aparece para el administrador.
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { can } from "../../../utils/roles";
import ThemeToggle from "../../../components/ThemeToggle";

type IconName = keyof typeof Ionicons.glyphMap;
// Ícono de cada pestaña: relleno cuando está activa, contorno cuando no.
const icon = (name: string) =>
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={(focused ? name : `${name}-outline`) as IconName} size={size} color={color as string} />;
  };

export default function TabsLayout() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => <ThemeToggle />,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: icon("home") }} />
      <Tabs.Screen name="catalogo" options={{ title: "Catálogo", tabBarIcon: icon("book") }} />
      <Tabs.Screen
        name="prestamos"
        options={{ title: can.manageLoans(user) ? "Préstamos" : "Mis préstamos", tabBarIcon: icon("swap-horizontal") }}
      />
      {/* href: null oculta la pestaña a quien no es administrador */}
      <Tabs.Screen
        name="usuarios"
        options={{ title: "Usuarios", tabBarIcon: icon("people"), href: can.manageUsers(user) ? undefined : null }}
      />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: icon("person-circle") }} />
    </Tabs>
  );
}
