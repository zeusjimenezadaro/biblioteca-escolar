// Perfil: datos de la cuenta, redes vinculadas, editar nombre, cambiar contraseña, tema y cerrar sesión.
import { useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { authService } from "../../../services";
import { ApiError } from "../../../services/api";
import { formatDate } from "../../../utils/roles";
import { validatePassword } from "../../../utils/validation";
import { RoleBadge } from "../../../components/Badges";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";
import ConfirmDialog from "../../../components/ConfirmDialog";
import InfoRow from "../../../components/InfoRow";
import Message from "../../../components/Message";
import Screen from "../../../components/Screen";
import TextField from "../../../components/TextField";
import type { FieldErrors, Provider } from "../../../types";

const PROVIDER_NAMES: Record<Provider, string> = { google: "Google", github: "GitHub", discord: "Discord" };

export default function Profile() {
  const { s, colors, isDark, toggle } = useTheme();
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [askLogout, setAskLogout] = useState(false);
  const [providers, setProviders] = useState<Provider[]>(user?.providers ?? []);

  // Trae las redes vinculadas (no vienen en el login).
  useEffect(() => {
    authService
      .me()
      .then((r) => setProviders(r.user.providers ?? []))
      .catch(() => {});
  }, []);

  if (!user) return null;

  async function save() {
    const found: FieldErrors = {};
    if (name.trim().length < 2) found.name = "Ingresá tu nombre (mínimo 2 letras).";
    if (newPassword) {
      const p = validatePassword(newPassword);
      if (p) found.newPassword = p;
      if (user!.hasPassword && !currentPassword) found.currentPassword = "Ingresá tu contraseña actual.";
    }
    setErrors(found);
    setMessage("");
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const r = await authService.updateMe({ name: name.trim(), ...(newPassword && { currentPassword, newPassword }) });
      setUser({ ...r.user, providers });
      setCurrentPassword("");
      setNewPassword("");
      toast({ type: "success", text: r.message });
    } catch (e) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      setMessage(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen narrow>
      {/* Datos de la cuenta */}
      <View style={[s.card, { alignItems: "center" }]}>
        <Avatar name={user.name} url={user.avatarUrl} size={80} />
        <Text style={[s.h2, { textAlign: "center" }]}>{user.name}</Text>
        <Text style={s.muted}>{user.email}</Text>
        <RoleBadge role={user.role} />
      </View>

      <View style={s.card}>
        <Text style={s.h3}>Tu cuenta</Text>
        <InfoRow label="Miembro desde" value={formatDate(user.createdAt)} />
        <InfoRow label="Contraseña" value={user.hasPassword ? "Configurada" : "Sin contraseña (red social)"} />
        <InfoRow label="Redes vinculadas" value={providers.length ? providers.map((p) => PROVIDER_NAMES[p]).join(", ") : "Ninguna"} />
      </View>

      {/* Editar datos */}
      <View style={[s.card, { gap: 14 }]}>
        <Text style={s.h3}>Editar perfil</Text>
        <TextField label="Nombre" value={name} onChangeText={setName} error={errors.name} autoComplete="name" />
        {user.hasPassword ? (
          <TextField
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={errors.currentPassword}
            password
            autoCapitalize="none"
            placeholder="Solo si vas a cambiarla"
          />
        ) : null}
        <TextField
          label={user.hasPassword ? "Nueva contraseña" : "Crear contraseña"}
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.newPassword}
          password
          autoCapitalize="none"
          placeholder="Opcional · mínimo 8, letras y números"
        />
        {message ? <Message type="error" text={message} /> : null}
        <Button label="Guardar cambios" icon="save-outline" onPress={save} loading={saving} />
      </View>

      {/* Preferencias */}
      <View style={[s.card, s.row, { justifyContent: "space-between" }]}>
        <View style={s.row}>
          <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.accent} />
          <Text style={s.label}>Modo oscuro</Text>
        </View>
        <Switch accessibilityLabel="Modo oscuro" value={isDark} onValueChange={toggle} trackColor={{ true: colors.accent, false: colors.line }} />
      </View>

      <Button label="Cerrar sesión" icon="log-out-outline" variant="danger" onPress={() => setAskLogout(true)} />

      <ConfirmDialog
        visible={askLogout}
        title="Cerrar sesión"
        text="Vas a tener que ingresar de nuevo para usar la app."
        confirmLabel="Cerrar sesión"
        onConfirm={() => {
          setAskLogout(false);
          logout();
        }}
        onCancel={() => setAskLogout(false)}
      />
    </Screen>
  );
}
