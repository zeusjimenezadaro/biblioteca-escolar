// Inicio: saludo y resumen distinto para cada rol, con accesos rápidos.
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useLoader } from "../../../hooks/useLoader";
import { statsService } from "../../../services";
import { can, ROLE_LABELS } from "../../../utils/roles";
import { RoleBadge } from "../../../components/Badges";
import Avatar from "../../../components/Avatar";
import Grid from "../../../components/Grid";
import Screen from "../../../components/Screen";
import { ErrorState, Loading } from "../../../components/StateViews";
import type { Href } from "expo-router";

type IconName = keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;

// Tarjeta con un número grande y su descripción.
function Stat({ icon, value, label, tone }: { icon: IconName; value: number; label: string; tone?: "warning" | "error" }) {
  const { s, colors } = useTheme();
  const color = tone === "warning" ? colors.warning : tone === "error" ? colors.error : colors.accent;
  return (
    <View style={[s.card, { minHeight: 118 }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// Acceso rápido a otra pantalla.
function Shortcut({ icon, title, text, href }: { icon: IconName; title: string; text: string; href: Href }) {
  const { s, colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [s.card, { flexDirection: "row", alignItems: "center", gap: 14 }, pressed && s.pressed]}
    >
      <View style={[s.avatar, { width: 46, height: 46, borderRadius: 14 }]}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.h3}>{title}</Text>
        <Text style={s.muted}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

export default function Home() {
  const { s } = useTheme();
  const { user } = useAuth();
  const { data, error, loading, refreshing, refresh, retry } = useLoader(() => statsService.get().then((r) => r.stats));
  if (!user) return null;
  const firstName = user.name.split(" ")[0];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {/* Bienvenida */}
      <View style={[s.hero, { flexDirection: "row", alignItems: "center", gap: 14 }]}>
        <Avatar name={user.name} url={user.avatarUrl} size={58} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={s.heroTitle}>¡Hola, {firstName}!</Text>
          <Text style={s.heroText}>Ingresaste como {ROLE_LABELS[user.role].toLowerCase()}.</Text>
        </View>
      </View>
      <RoleBadge role={user.role} />

      {/* Resumen según el rol */}
      <Text style={s.h2}>Resumen</Text>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState text={error} onRetry={retry} />
      ) : data?.myLoans ? (
        <Grid min={2}>
          <Stat icon="time-outline" value={data.myLoans.pendiente ?? 0} label="Pedidos pendientes" tone="warning" />
          <Stat icon="book-outline" value={data.myLoans.aprobado ?? 0} label="Libros en mi poder" />
          <Stat icon="checkmark-done-outline" value={data.myLoans.devuelto ?? 0} label="Devueltos" />
          <Stat icon="close-circle-outline" value={data.myLoans.rechazado ?? 0} label="Rechazados" tone="error" />
        </Grid>
      ) : data ? (
        <Grid min={2}>
          <Stat icon="library-outline" value={data.books?.titles ?? 0} label="Títulos en el catálogo" />
          <Stat icon="layers-outline" value={data.books?.available ?? 0} label={`Ejemplares disponibles de ${data.books?.copies ?? 0}`} />
          <Stat icon="time-outline" value={data.loans?.pendiente ?? 0} label="Pedidos por revisar" tone="warning" />
          <Stat icon="alert-circle-outline" value={data.overdue ?? 0} label="Devoluciones vencidas" tone="error" />
          {data.users ? <Stat icon="people-outline" value={Object.values(data.users).reduce((a, b) => a + (b ?? 0), 0)} label="Usuarios registrados" /> : null}
          {data.users ? <Stat icon="school-outline" value={data.users.alumno ?? 0} label="Alumnos" /> : null}
        </Grid>
      ) : null}

      {/* Accesos rápidos según lo que puede hacer el rol */}
      <Text style={s.h2}>Accesos rápidos</Text>
      <Grid>
        <Shortcut icon="search" title="Buscar libros" text="Explorá el catálogo completo." href="/catalogo" />
        {can.requestLoans(user) ? <Shortcut icon="swap-horizontal" title="Mis préstamos" text="Seguí el estado de tus pedidos." href="/prestamos" /> : null}
        {can.manageLoans(user) ? <Shortcut icon="checkmark-circle-outline" title="Revisar préstamos" text="Aprobá o rechazá pedidos." href="/prestamos" /> : null}
        {can.manageBooks(user) ? <Shortcut icon="add-circle-outline" title="Agregar libro" text="Cargá un título nuevo." href="/libro/editar" /> : null}
        {can.manageUsers(user) ? <Shortcut icon="people-outline" title="Gestionar usuarios" text="Roles y estado de las cuentas." href="/usuarios" /> : null}
      </Grid>
    </Screen>
  );
}
