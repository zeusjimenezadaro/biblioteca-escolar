// Insignias de rol y de estado de préstamo, con colores que se entienden de un vistazo.
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import { ROLE_ICONS, ROLE_LABELS, STATUS_LABELS } from "../utils/roles";
import type { LoanStatus, Role } from "../types";

export function RoleBadge({ role }: { role: Role }) {
  const { s, colors } = useTheme();
  return (
    <View style={[s.badge, { backgroundColor: colors.accentSoft }]}>
      <Ionicons name={ROLE_ICONS[role]} size={14} color={colors.accent} />
      <Text style={[s.badgeText, { color: colors.accent }]}>{ROLE_LABELS[role]}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: LoanStatus }) {
  const { s, colors } = useTheme();
  // Pendiente = amarillo, prestado = azul, devuelto = verde, rechazado = rojo.
  const palette = {
    pendiente: [colors.warningSoft, colors.warning],
    aprobado: [colors.accentSoft, colors.accent],
    devuelto: [colors.successSoft, colors.success],
    rechazado: [colors.errorSoft, colors.error],
  }[status];
  return (
    <View style={[s.badge, { backgroundColor: palette[0] }]}>
      <Text style={[s.badgeText, { color: palette[1] }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}
