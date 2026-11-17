// Pantallas con sesión: las pestañas y las pantallas de detalle que se abren encima.
import { Stack } from "expo-router";
import { useTheme } from "../../theme/ThemeProvider";
import ThemeToggle from "../../components/ThemeToggle";

export default function AppLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bg },
        headerRight: () => <ThemeToggle />,
        headerBackTitle: "Volver",
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="libro/[id]" options={{ title: "Detalle del libro" }} />
      <Stack.Screen name="libro/editar" options={{ title: "Libro" }} />
    </Stack>
  );
}
