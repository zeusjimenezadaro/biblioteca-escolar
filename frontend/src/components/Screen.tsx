// Contenedor de pantalla con desplazamiento, «tirar para actualizar» y ancho máximo en tablets.
import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeProvider";

type Props = {
  children: ReactNode;
  narrow?: boolean; // Ancho de formulario (más angosto).
  refreshing?: boolean;
  onRefresh?: () => void; // Si se pasa, se puede tirar hacia abajo para recargar.
  bottomSpace?: number; // Espacio extra abajo (por ejemplo, para el botón flotante).
  safeTop?: boolean; // Pantallas sin barra superior: deja libre la zona del reloj y la batería.
};

export default function Screen({ children, narrow, refreshing = false, onRefresh, bottomSpace = 0, safeTop }: Props) {
  const { s, colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[
        s.scroll,
        // Márgenes seguros: en horizontal, la barra de Android puede quedar a un costado.
        { paddingBottom: 24 + insets.bottom + bottomSpace, paddingLeft: 20 + insets.left, paddingRight: 20 + insets.right },
        safeTop && { paddingTop: 20 + insets.top },
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} /> : undefined
      }
    >
      <View style={narrow ? s.narrow : s.content}>{children}</View>
    </ScrollView>
  );
}
