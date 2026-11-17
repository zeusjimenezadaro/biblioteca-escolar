// Préstamos. Alumno: sus pedidos y cancelar los pendientes.
// Bibliotecario y admin: todos los pedidos, con aprobar, rechazar y registrar devolución.
import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useLoader } from "../../../hooks/useLoader";
import { loansService } from "../../../services";
import { can, STATUS_LABELS } from "../../../utils/roles";
import Chip from "../../../components/Chip";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Grid from "../../../components/Grid";
import LoanCard from "../../../components/LoanCard";
import Screen from "../../../components/Screen";
import { Empty, ErrorState, Loading } from "../../../components/StateViews";
import type { Loan, LoanAction, LoanStatus } from "../../../types";

const FILTERS: (LoanStatus | "")[] = ["", "pendiente", "aprobado", "devuelto", "rechazado"];

export default function Loans() {
  const { s } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const staff = can.manageLoans(user);
  // El personal empieza viendo los pendientes (lo que tiene que revisar); el alumno, todos los suyos.
  const [status, setStatus] = useState<LoanStatus | "">(staff ? "pendiente" : "");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Loan | null>(null); // Préstamo a confirmar antes de borrar.
  const loans = useLoader(() => loansService.list(status || undefined).then((r) => r.items), [status]);

  // Aprobar, rechazar o registrar devolución.
  async function act(loan: Loan, action: LoanAction) {
    setBusyId(loan.id);
    try {
      const r = await loansService.act(loan.id, action);
      toast({ type: "success", text: r.message });
      loans.refresh();
    } catch (e) {
      toast({ type: "error", text: e instanceof Error ? e.message : "No se pudo completar la acción." });
    } finally {
      setBusyId(null);
    }
  }

  // Cancelar (alumno) o eliminar el registro (admin), después de confirmar.
  async function confirmDelete() {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      const r = await loansService.remove(toDelete.id);
      toast({ type: "success", text: r.message });
      loans.refresh();
    } catch (e) {
      toast({ type: "error", text: e instanceof Error ? e.message : "No se pudo eliminar." });
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  }

  const isAdmin = user?.role === "admin";
  return (
    <Screen refreshing={loans.refreshing} onRefresh={loans.refresh}>
      <Text style={s.muted}>
        {staff ? "Revisá los pedidos de los alumnos y registrá las devoluciones." : "Seguí el estado de los libros que pediste."}
      </Text>

      {/* Filtro por estado */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => (
          <Chip key={f || "todos"} label={f ? STATUS_LABELS[f] : "Todos"} active={status === f} onPress={() => setStatus(f)} />
        ))}
      </ScrollView>

      {loans.loading ? (
        <Loading text="Cargando préstamos…" />
      ) : loans.error ? (
        <ErrorState text={loans.error} onRetry={loans.retry} />
      ) : !loans.data?.length ? (
        <Empty
          icon="file-tray-outline"
          title="No hay préstamos"
          text={staff ? "No hay préstamos con este estado." : "Pedí un libro desde el catálogo."}
        />
      ) : (
        <Grid>
          {loans.data.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              showStudent={staff}
              canManage={staff}
              canCancel={can.requestLoans(user) && loan.userId === user?.id}
              canDelete={isAdmin}
              busy={busyId === loan.id}
              onAction={(action) => act(loan, action)}
              onDelete={() => setToDelete(loan)}
            />
          ))}
        </Grid>
      )}

      <ConfirmDialog
        visible={!!toDelete}
        title={isAdmin ? "Eliminar registro" : "Cancelar pedido"}
        text={isAdmin ? `Se eliminará el préstamo de «${toDelete?.bookTitle}». No se puede deshacer.` : `¿Cancelar el pedido de «${toDelete?.bookTitle}»?`}
        confirmLabel={isAdmin ? "Eliminar" : "Cancelar pedido"}
        loading={busyId === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Screen>
  );
}
