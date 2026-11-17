// Tarjeta de un préstamo con las acciones que permite el rol del usuario.
import { Text, View } from "react-native";
import Button from "./Button";
import { StatusBadge } from "./Badges";
import { useTheme } from "../theme/ThemeProvider";
import { formatDate } from "../utils/roles";
import type { Loan, LoanAction } from "../types";

type Props = {
  loan: Loan;
  showStudent: boolean; // El personal ve quién lo pidió.
  canManage: boolean; // Aprobar, rechazar, registrar devolución.
  canCancel: boolean; // El alumno cancela sus pedidos pendientes.
  canDelete: boolean; // El admin borra registros cerrados.
  busy: boolean;
  onAction: (action: LoanAction) => void;
  onDelete: () => void;
};

export default function LoanCard({ loan, showStudent, canManage, canCancel, canDelete, busy, onAction, onDelete }: Props) {
  const { s, colors } = useTheme();
  // Vencido: aprobado y la fecha de devolución ya pasó.
  const overdue = loan.status === "aprobado" && !!loan.dueDate && loan.dueDate < new Date().toISOString().slice(0, 10);
  return (
    <View style={s.card}>
      <View style={[s.row, { justifyContent: "space-between", alignItems: "flex-start" }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={2} style={s.h3}>
            {loan.bookTitle}
          </Text>
          <Text numberOfLines={1} style={s.muted}>
            {loan.bookAuthor}
          </Text>
        </View>
        <StatusBadge status={loan.status} />
      </View>

      {showStudent ? <Text style={s.small}>Alumno: {loan.userName} · {loan.userEmail}</Text> : null}
      <Text style={s.small}>
        Pedido el {formatDate(loan.requestedAt)}
        {loan.dueDate && loan.status === "aprobado" ? ` · Devolver antes del ${formatDate(loan.dueDate)}` : ""}
        {loan.returnedAt ? ` · Devuelto el ${formatDate(loan.returnedAt)}` : ""}
      </Text>
      {overdue ? <Text style={[s.small, { color: colors.error, fontWeight: "700" }]}>⚠ Devolución vencida</Text> : null}

      {/* Acciones según el estado del préstamo y el rol */}
      <View style={[s.row, { flexWrap: "wrap" }]}>
        {canManage && loan.status === "pendiente" ? (
          <>
            <Button small grow icon="checkmark" label="Aprobar" onPress={() => onAction("aprobar")} disabled={busy} />
            <Button small grow icon="close" variant="secondary" label="Rechazar" onPress={() => onAction("rechazar")} disabled={busy} />
          </>
        ) : null}
        {canManage && loan.status === "aprobado" ? (
          <Button small grow icon="return-down-back" label="Registrar devolución" onPress={() => onAction("devolver")} disabled={busy} />
        ) : null}
        {canCancel && loan.status === "pendiente" ? (
          <Button small grow icon="close-circle" variant="secondary" label="Cancelar pedido" onPress={onDelete} disabled={busy} />
        ) : null}
        {canDelete && loan.status !== "aprobado" && loan.status !== "pendiente" ? (
          <Button small grow icon="trash" variant="danger" label="Eliminar registro" onPress={onDelete} disabled={busy} />
        ) : null}
      </View>
    </View>
  );
}
