// Inicio de sesión con correo y contraseña, o con una red social.
import { useRef, useState } from "react";
import type { ComponentRef } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/ThemeProvider";
import { ApiError } from "../../services/api";
import { validateLoginForm } from "../../utils/validation";
import AuthHeader from "../../components/AuthHeader";
import Button from "../../components/Button";
import Message from "../../components/Message";
import Screen from "../../components/Screen";
import SocialButtons from "../../components/SocialButtons";
import TextField from "../../components/TextField";
import type { FieldErrors } from "../../types";

export default function Login() {
  const { s } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({}); // Errores debajo de cada campo.
  const [message, setMessage] = useState(""); // Error general (credenciales, conexión).
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  async function submit() {
    // 1. Validar en la app antes de llamar al servidor.
    const found = validateLoginForm(email, password);
    setErrors(found);
    setMessage("");
    if (Object.keys(found).length) return;
    // 2. Enviar; si sale bien, el AuthContext guarda la sesión y la navegación cambia sola.
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen narrow safeTop>
        <AuthHeader title="Hola de nuevo" subtitle="Ingresá para consultar el catálogo y tus préstamos." />

        <View style={[s.card, { gap: 14 }]}>
          <Text style={s.h2}>Iniciar sesión</Text>
          <TextField
            label="Correo electrónico"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setErrors((e) => ({ ...e, email: "" }));
            }}
            error={errors.email}
            placeholder="nombre@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
          />
          <TextField
            ref={passwordRef}
            label="Contraseña"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setErrors((e) => ({ ...e, password: "" }));
            }}
            error={errors.password}
            placeholder="Tu contraseña"
            password
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!loading}
          />
          {message ? <Message type="error" text={message} /> : null}
          <Button label="Ingresar" icon="log-in-outline" onPress={submit} loading={loading} />

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.small}>o continuá con</Text>
            <View style={s.dividerLine} />
          </View>
          <SocialButtons onError={setMessage} disabled={loading} />
        </View>

        <View style={[s.row, { justifyContent: "center", flexWrap: "wrap" }]}>
          <Text style={s.muted}>¿No tenés cuenta?</Text>
          <Link href="/register" replace style={s.link}>
            Registrate
          </Link>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
