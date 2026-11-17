// Gestión de usuarios (solo administrador): buscar, cambiar rol, activar/desactivar y eliminar.
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useLoader } from "../../../hooks/useLoader";
import { usersService } from "../../../services";
import { can, ROLE_LABELS } from "../../../utils/roles";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";
import Chip from "../../../components/Chip";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Grid from "../../../components/Grid";
import Screen from "../../../components/Screen";
import TextField from "../../../components/TextField";
import { Empty, ErrorState, Loading } from "../../../components/StateViews";
import type { Role, User } from "../../../types";

const ROLES: Role[] = ["admin", "bibliotecario", "alumno"];

export default function Users() {
  const { s, colors } = useTheme();
  const { user: me } = useAuth();
  const toast = useToast();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQ(text.trim()), 400);
    return () => clearTimeout(timer);
  }, [text]);

  const users = useLoader(() => usersService.list(q).then((r) => r.items), [q]);

  // Si alguien que no es admin llega acá (por ejemplo, con un enlace), vuelve al inicio.
  if (!can.manageUsers(me)) return <Redirect href="/" />;

  // Cambia el rol o el estado y actualiza la lista sin recargarla entera.
  async function update(u: User, data: { role?: Role; active?: boolean }) {
    setBusyId(u.id);
    try {
      const r = await usersService.update(u.id, data);
      users.setData((list) => list?.map((x) => (x.id === u.id ? r.user : x)) ?? null);
      toast({ type: "success", text: r.message });
    } catch (e) {
      toast({ type: "error", text: e instanceof Error ? e.message : "No se pudo actualizar." });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      const r = await usersService.remove(toDelete.id);
      users.setData((list) => list?.filter((x) => x.id !== toDelete.id) ?? null);
      toast({ type: "success", text: r.message });
    } catch (e) {
      toast({ type: "error", text: e instanceof Error ? e.message : "No se pudo eliminar." });
    } finally {
      setBusyId(null);
      setToDelete(null);
    }
  }

  return (
    <Screen refreshing={users.refreshing} onRefresh={users.refresh}>
      <TextField label="Buscar usuarios" value={text} onChangeText={setText} placeholder="Nombre o correo" autoCapitalize="none" />

      {users.loading ? (
        <Loading text="Cargando usuarios…" />
      ) : users.error ? (
        <ErrorState text={users.error} onRetry={users.retry} />
      ) : !users.data?.length ? (
        <Empty icon="people-outline" title="Sin resultados" text="No hay usuarios que coincidan con la búsqueda." />
      ) : (
        <Grid>
          {users.data.map((u) => {
            const self = u.id === me?.id; // No puede cambiarse a sí mismo.
            const busy = busyId === u.id;
            return (
              <View key={u.id} style={[s.card, !u.active && { opacity: 0.7 }]}>
                <View style={s.row}>
                  <Avatar name={u.name} url={u.avatarUrl} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={s.h3}>
                      {u.name} {self ? "(vos)" : ""}
                    </Text>
                    <Text numberOfLines={1} style={s.muted}>
                      {u.email}
                    </Text>
                  </View>
                </View>

                <Text style={s.label}>Rol</Text>
                <View style={s.wrap}>
                  {ROLES.map((r) => (
                    <Chip key={r} label={ROLE_LABELS[r]} active={u.role === r} onPress={() => !self && !busy && u.role !== r && update(u, { role: r })} />
                  ))}
                </View>

                <View style={[s.row, { justifyContent: "space-between" }]}>
                  <Text style={s.label}>{u.active ? "Cuenta activa" : "Cuenta desactivada"}</Text>
                  <Switch
                    accessibilityLabel={u.active ? "Desactivar cuenta" : "Activar cuenta"}
                    value={u.active}
                    disabled={self || busy}
                    onValueChange={(value) => update(u, { active: value })}
                    trackColor={{ true: colors.accent, false: colors.line }}
                  />
                </View>
                {self ? <Text style={s.small}>No podés cambiar tu propio rol ni desactivarte.</Text> : null}
                {!self ? <Button small icon="trash-outline" variant="danger" label="Eliminar usuario" onPress={() => setToDelete(u)} disabled={busy} /> : null}
              </View>
            );
          })}
        </Grid>
      )}

      <ConfirmDialog
        visible={!!toDelete}
        title="Eliminar usuario"
        text={`Se eliminará la cuenta de ${toDelete?.name} y todos sus préstamos. No se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={busyId === toDelete?.id}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Screen>
  );
}
