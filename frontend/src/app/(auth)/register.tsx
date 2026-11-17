// Registro de una cuenta nueva (empieza con el rol «Alumno»).
import { useRef, useState } from "react";
import type { ComponentRef } from "react";
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/ThemeProvider";
import { ApiError } from "../../services/api";
import { validateRegisterForm } from "../../utils/validation";
import AuthHeader from "../../components/AuthHeader";
import Button from "../../components/Button";
import Message from "../../components/Message";
import Screen from "../../components/Screen";
import SocialButtons from "../../components/SocialButtons";
import TextField from "../../components/TextField";
import type { FieldErrors } from "../../types";

export default function Register() {
  const { s } = useTheme();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const confirmRef = useRef<ComponentRef<typeof TextInput>>(null);

  // Actualiza un campo y borra su error.
  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit() {
    const found = validateRegisterForm(form);
    setErrors(found);
    setMessage("");
    if (Object.keys(found).length) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setMessage(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen narrow safeTop>
        <AuthHeader title="Creá tu cuenta" subtitle="Registrate para pedir libros prestados." />

        <View style={[s.card, { gap: 14 }]}>
          <Text style={s.h2}>Registrarse</Text>
          <TextField
            label="Nombre y apellido"
            value={form.name}
            onChangeText={set("name")}
            error={errors.name}
            placeholder="Ej.: Ana Pérez"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            editable={!loading}
          />
          <TextField
            ref={emailRef}
            label="Correo electrónico"
            value={form.email}
            onChangeText={set("email")}
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
            value={form.password}
            onChangeText={set("password")}
            error={errors.password}
            placeholder="Mínimo 8 caracteres, con letras y números"
            password
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            editable={!loading}
          />
          <TextField
            ref={confirmRef}
            label="Repetir contraseña"
            value={form.confirm}
            onChangeText={set("confirm")}
            error={errors.confirm}
            placeholder="Escribila de nuevo"
            password
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!loading}
          />
          {message ? <Message type="error" text={message} /> : null}
          <Button label="Crear cuenta" icon="person-add-outline" onPress={submit} loading={loading} />

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.small}>o registrate con</Text>
            <View style={s.dividerLine} />
          </View>
          <SocialButtons onError={setMessage} disabled={loading} />
        </View>

        <View style={[s.row, { justifyContent: "center", flexWrap: "wrap" }]}>
          <Text style={s.muted}>¿Ya tenés cuenta?</Text>
          <Link href="/login" replace style={s.link}>
            Iniciá sesión
          </Link>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
