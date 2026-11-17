// Formulario para agregar un libro (sin ?id) o editarlo (con ?id). Solo personal de la biblioteca.
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useResponsive } from "../../../hooks/useResponsive";
import { booksService } from "../../../services";
import { ApiError } from "../../../services/api";
import { can } from "../../../utils/roles";
import { validateBookForm } from "../../../utils/validation";
import Button from "../../../components/Button";
import Message from "../../../components/Message";
import Screen from "../../../components/Screen";
import TextField from "../../../components/TextField";
import { Loading } from "../../../components/StateViews";
import type { BookInput, FieldErrors } from "../../../types";

const EMPTY: BookInput = { title: "", author: "", isbn: "", category: "", year: "", totalCopies: "1", description: "" };

export default function BookForm() {
  const { s } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { isWide } = useResponsive();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const [form, setForm] = useState<BookInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(editing); // Cargando los datos del libro a editar.
  const [saving, setSaving] = useState(false);

  // Al editar, completa el formulario con los datos actuales.
  useEffect(() => {
    if (!editing) return;
    booksService
      .get(Number(id))
      .then(({ book: b }) =>
        setForm({
          title: b.title,
          author: b.author,
          isbn: b.isbn ?? "",
          category: b.category,
          year: b.year ? String(b.year) : "",
          totalCopies: String(b.totalCopies),
          description: b.description ?? "",
        }),
      )
      .catch((e: Error) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, [editing, id]);

  if (!can.manageBooks(user)) return <Redirect href="/" />;

  const set = (key: keyof BookInput) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function save() {
    const found = validateBookForm(form);
    setErrors(found);
    setMessage("");
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      const r = editing ? await booksService.update(Number(id), form) : await booksService.create(form);
      toast({ type: "success", text: r.message });
      router.back();
    } catch (e) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      setMessage(e instanceof Error ? e.message : "No se pudo guardar.");
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  // En pantallas anchas, algunos campos van de a dos por fila.
  const pair = { flexDirection: isWide ? ("row" as const) : ("column" as const), gap: 14 };
  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: editing ? "Editar libro" : "Agregar libro" }} />
      <Screen narrow={!isWide}>
        <View style={[s.card, { gap: 14 }]}>
          <Text style={s.h2}>{editing ? "Editar libro" : "Nuevo libro"}</Text>
          <TextField label="Título *" value={form.title} onChangeText={set("title")} error={errors.title} maxLength={200} />
          <TextField label="Autor *" value={form.author} onChangeText={set("author")} error={errors.author} maxLength={150} />
          <View style={pair}>
            <View style={s.flex}>
              <TextField label="Categoría *" value={form.category} onChangeText={set("category")} error={errors.category} placeholder="Ej.: Novela" maxLength={60} />
            </View>
            <View style={s.flex}>
              <TextField label="ISBN" value={form.isbn} onChangeText={set("isbn")} error={errors.isbn} placeholder="Opcional" keyboardType="numbers-and-punctuation" maxLength={17} />
            </View>
          </View>
          <View style={pair}>
            <View style={s.flex}>
              <TextField label="Año" value={form.year} onChangeText={set("year")} error={errors.year} placeholder="Ej.: 1967" keyboardType="number-pad" maxLength={4} />
            </View>
            <View style={s.flex}>
              <TextField label="Ejemplares *" value={form.totalCopies} onChangeText={set("totalCopies")} error={errors.totalCopies} keyboardType="number-pad" maxLength={3} />
            </View>
          </View>
          <TextField label="Descripción" value={form.description} onChangeText={set("description")} error={errors.description} multiline maxLength={2000} placeholder="Opcional" />
          <Text style={s.small}>* Campos obligatorios</Text>
          {message ? <Message type="error" text={message} /> : null}
          <View style={s.row}>
            <Button grow label="Cancelar" variant="secondary" onPress={() => router.back()} disabled={saving} />
            <Button grow label={editing ? "Guardar" : "Agregar"} icon="save-outline" onPress={save} loading={saving} />
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
