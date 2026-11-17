// Detalle de un libro. Alumno: pedir préstamo. Personal: editar o eliminar.
import { useState } from "react";
import { Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useLoader } from "../../../hooks/useLoader";
import { useResponsive } from "../../../hooks/useResponsive";
import { booksService, loansService } from "../../../services";
import { can } from "../../../utils/roles";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import InfoRow from "../../../components/InfoRow";
import Message from "../../../components/Message";
import Screen from "../../../components/Screen";
import { ErrorState, Loading } from "../../../components/StateViews";

export default function BookDetail() {
  const { s, colors } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { isWide } = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useLoader(() => booksService.get(Number(id)).then((r) => r.book), [id]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [askDelete, setAskDelete] = useState(false);

  async function requestLoan() {
    setBusy(true);
    setMessage(null);
    try {
      const r = await loansService.request(Number(id));
      setMessage({ type: "success", text: r.message });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "No se pudo pedir el préstamo." });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const r = await booksService.remove(Number(id));
      toast({ type: "success", text: r.message });
      router.back(); // Vuelve al catálogo, que se recarga solo.
    } catch (e) {
      setAskDelete(false);
      setMessage({ type: "error", text: e instanceof Error ? e.message : "No se pudo eliminar." });
      setBusy(false);
    }
  }

  if (book.loading) return <Loading />;
  if (book.error || !book.data) {
    return (
      <Screen narrow>
        <ErrorState text={book.error || "El libro no existe."} onRetry={book.retry} />
      </Screen>
    );
  }
  const b = book.data;
  const available = b.availableCopies > 0;

  return (
    <Screen narrow refreshing={book.refreshing} onRefresh={book.refresh}>
      <Stack.Screen options={{ title: b.title }} />

      {/* Portada y datos principales (en pantallas anchas, uno al lado del otro) */}
      <View style={[s.card, { flexDirection: isWide ? "row" : "column", gap: 16, alignItems: isWide ? "flex-start" : "center" }]}>
        <View style={{ width: 110, height: 150, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="book" size={56} color={colors.accent} />
        </View>
        <View style={{ flex: isWide ? 1 : undefined, gap: 6, alignItems: isWide ? "flex-start" : "center" }}>
          <Text style={[s.h1, { textAlign: isWide ? "left" : "center", fontSize: 24, lineHeight: 30 }]}>{b.title}</Text>
          <Text style={[s.text, { color: colors.muted }]}>{b.author}</Text>
          <Text style={[s.text, { fontWeight: "700", color: available ? colors.success : colors.error }]}>
            {available ? `${b.availableCopies} de ${b.totalCopies} ejemplares disponibles` : "Sin ejemplares disponibles"}
          </Text>
        </View>
      </View>

      <View style={s.card}>
        <InfoRow label="Categoría" value={b.category} />
        <InfoRow label="Año" value={b.year ? String(b.year) : "—"} />
        <InfoRow label="ISBN" value={b.isbn ?? "—"} />
        {b.description ? <Text style={[s.text, { marginTop: 4 }]}>{b.description}</Text> : null}
      </View>

      {message ? <Message type={message.type} text={message.text} /> : null}

      {/* Acciones según el rol */}
      {can.requestLoans(user) ? (
        <Button label="Pedir préstamo" icon="hand-left-outline" onPress={requestLoan} loading={busy} disabled={!available} />
      ) : null}
      {can.manageBooks(user) ? (
        <View style={s.row}>
          <Button grow label="Editar" icon="create-outline" variant="secondary" onPress={() => router.push(`/libro/editar?id=${b.id}`)} />
          <Button grow label="Eliminar" icon="trash-outline" variant="danger" onPress={() => setAskDelete(true)} />
        </View>
      ) : null}

      <ConfirmDialog
        visible={askDelete}
        title="Eliminar libro"
        text={`Se eliminará «${b.title}» del catálogo junto con su historial de préstamos. No se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setAskDelete(false)}
      />
    </Screen>
  );
}
