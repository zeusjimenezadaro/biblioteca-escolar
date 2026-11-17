// Estilos compartidos, generados a partir de la paleta activa (clara u oscura).
import { StyleSheet } from "react-native";
import type { Colors } from "./colors";

export function makeStyles(c: Colors) {
  return StyleSheet.create({
    // Estructura
    screen: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: 20, gap: 16 },
    content: { width: "100%", maxWidth: 960, alignSelf: "center", gap: 16 },
    narrow: { width: "100%", maxWidth: 480, alignSelf: "center", gap: 16 }, // Formularios.
    row: { flexDirection: "row", gap: 10, alignItems: "center" },
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    flex: { flex: 1 },
    center: { alignItems: "center", justifyContent: "center" },

    // Textos
    eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.2, color: c.accent },
    h1: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: c.ink },
    h2: { fontSize: 20, lineHeight: 26, fontWeight: "700", color: c.ink },
    h3: { fontSize: 16, lineHeight: 22, fontWeight: "700", color: c.ink },
    text: { fontSize: 15, lineHeight: 22, color: c.ink },
    muted: { fontSize: 14, lineHeight: 20, color: c.muted },
    small: { fontSize: 12, lineHeight: 16, color: c.muted },
    link: { fontSize: 15, fontWeight: "700", color: c.accent },

    // Tarjetas
    card: { backgroundColor: c.card, borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: c.line },
    hero: { backgroundColor: c.header, borderRadius: 22, padding: 20, gap: 8 },
    heroTitle: { fontSize: 24, lineHeight: 30, fontWeight: "800", color: "#ffffff" },
    heroText: { fontSize: 14, lineHeight: 20, color: "#c9cdea" },

    // Campos de formulario
    label: { fontSize: 14, fontWeight: "600", color: c.ink },
    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: c.ink,
      backgroundColor: c.input,
    },
    inputMultiline: { minHeight: 100, textAlignVertical: "top" },
    inputError: { borderColor: c.error },
    fieldError: { fontSize: 13, lineHeight: 18, color: c.error },

    // Botones (alto mínimo para que el texto no se corte)
    button: {
      minHeight: 50,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    buttonText: { color: c.onAccent, fontSize: 16, fontWeight: "700", textAlign: "center", flexShrink: 1 },
    buttonSecondary: { backgroundColor: c.card, borderWidth: 1.5, borderColor: c.accent },
    buttonSecondaryText: { color: c.accent },
    buttonDanger: { backgroundColor: c.error },
    buttonDangerText: { color: "#ffffff" },
    buttonSmall: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
    pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
    disabled: { opacity: 0.45 },

    // Chips de filtro
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { fontSize: 14, fontWeight: "600", color: c.ink },
    chipTextActive: { color: c.onAccent },

    // Mensajes (alto mínimo para que no cambie el tamaño entre uno corto y uno largo)
    message: { flexDirection: "row", gap: 10, alignItems: "center", minHeight: 52, padding: 12, borderRadius: 12 },
    messageText: { flex: 1, fontSize: 14, lineHeight: 20 },

    // Insignias de rol y estado
    badge: { alignSelf: "flex-start", flexDirection: "row", gap: 6, alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: "700" },

    // Avatar con iniciales
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentSoft, alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 20, fontWeight: "800", color: c.accent },

    // Estadísticas de la pantalla de inicio
    statValue: { fontSize: 28, fontWeight: "800", color: c.ink, fontVariant: ["tabular-nums"] },
    statLabel: { fontSize: 13, lineHeight: 18, color: c.muted },

    // Fila de dato (etiqueta y valor)
    infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: c.line },
    infoLabel: { fontSize: 14, fontWeight: "600", color: c.ink },
    infoValue: { fontSize: 14, color: c.muted, flexShrink: 1, textAlign: "right" },

    // Botón flotante (agregar)
    fab: {
      position: "absolute",
      right: 20,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },

    // Separador «o continuá con»
    divider: { flexDirection: "row", alignItems: "center", gap: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.line },

    // Ventana de confirmación
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
    dialog: { width: "100%", maxWidth: 420, backgroundColor: c.card, borderRadius: 20, padding: 20, gap: 12 },

    // Aviso emergente (toast)
    toast: {
      position: "absolute",
      left: 16,
      right: 16,
      alignSelf: "center",
      maxWidth: 520,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      padding: 14,
      borderRadius: 14,
      elevation: 8,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
  });
}

export type Styles = ReturnType<typeof makeStyles>;
