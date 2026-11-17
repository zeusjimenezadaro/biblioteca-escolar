// Raíz de la app: proveedores globales (tema, sesión, avisos) y protección de rutas.
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import { Loading } from "../components/StateViews";

// Decide qué grupo de pantallas se puede usar según haya sesión o no.
function RootNavigator() {
  const { status } = useAuth();
  const { colors } = useTheme();

  // Mientras se recupera la sesión guardada, se muestra una pantalla de carga.
  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
        <Loading text="Abriendo la biblioteca…" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {/* Con sesión: la app. Sin sesión: login y registro. Expo Router redirige solo. */}
      <Stack.Protected guard={status === "signedIn"}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === "signedOut"}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      {/* Pantalla a la que vuelve el login con redes sociales */}
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
