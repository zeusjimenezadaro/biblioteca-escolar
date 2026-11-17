// Catálogo: búsqueda, filtro por categoría, paginación y (para el personal) botón para agregar.
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../theme/ThemeProvider";
import { useLoader } from "../../../hooks/useLoader";
import { booksService } from "../../../services";
import { can } from "../../../utils/roles";
import BookCard from "../../../components/BookCard";
import Button from "../../../components/Button";
import Chip from "../../../components/Chip";
import Grid from "../../../components/Grid";
import Screen from "../../../components/Screen";
import TextField from "../../../components/TextField";
import { Empty, ErrorState, Loading } from "../../../components/StateViews";
import type { Book } from "../../../types";

export default function Catalog() {
  const { s, colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(""); // Lo que se escribe en el buscador.
  const [q, setQ] = useState(""); // Búsqueda aplicada (espera a que se deje de escribir).
  const [category, setCategory] = useState("");
  const [extra, setExtra] = useState<Book[]>([]); // Libros de las páginas siguientes.
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState("");

  // Espera 400 ms sin escribir antes de buscar (no consulta la API con cada letra).
  useEffect(() => {
    const timer = setTimeout(() => setQ(text.trim()), 400);
    return () => clearTimeout(timer);
  }, [text]);

  const categories = useLoader(() => booksService.categories().then((r) => r.categories));
  const books = useLoader(() => {
    setExtra([]);
    setPage(1);
    return booksService.list({ q, category, page: 1 });
  }, [q, category]);

  // Carga la página siguiente y la agrega abajo.
  async function loadMore() {
    setLoadingMore(true);
    setMoreError("");
    try {
      const next = await booksService.list({ q, category, page: page + 1 });
      setExtra((list) => [...list, ...next.items]);
      setPage(next.page);
    } catch (e) {
      setMoreError(e instanceof Error ? e.message : "No se pudieron cargar más libros.");
    } finally {
      setLoadingMore(false);
    }
  }

  const items = [...(books.data?.items ?? []), ...extra];
  const canAdd = can.manageBooks(user);

  return (
    <View style={s.flex}>
      <Screen refreshing={books.refreshing} onRefresh={books.refresh} bottomSpace={canAdd ? 80 : 0}>
        <TextField
          label="Buscar"
          value={text}
          onChangeText={setText}
          placeholder="Título, autor o ISBN"
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {/* Categorías (deslizables en celular) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Todas" active={!category} onPress={() => setCategory("")} />
          {(categories.data ?? []).map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(category === c ? "" : c)} />
          ))}
        </ScrollView>

        {books.loading ? (
          <Loading text="Buscando libros…" />
        ) : books.error ? (
          <ErrorState text={books.error} onRetry={books.retry} />
        ) : items.length === 0 ? (
          <Empty icon="search-outline" title="No hay resultados" text="Probá con otra búsqueda o categoría." />
        ) : (
          <>
            <Text style={s.muted}>
              {books.data!.total} {books.data!.total === 1 ? "libro encontrado" : "libros encontrados"}
            </Text>
            <Grid>
              {items.map((b) => (
                <BookCard key={b.id} book={b} onPress={() => router.push(`/libro/${b.id}`)} />
              ))}
            </Grid>
            {moreError ? <Text style={s.fieldError}>{moreError}</Text> : null}
            {page < books.data!.pages ? <Button label="Cargar más" variant="secondary" onPress={loadMore} loading={loadingMore} /> : null}
          </>
        )}
      </Screen>

      {/* Botón flotante «+» para agregar libros (solo personal) */}
      {canAdd ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar libro"
          onPress={() => router.push("/libro/editar")}
          style={({ pressed }) => [s.fab, { bottom: 20, right: 20 + insets.right }, pressed && s.pressed]}
        >
          <Ionicons name="add" size={30} color={colors.onAccent} />
        </Pressable>
      ) : null}
    </View>
  );
}
