// Tarjeta de un libro en el catálogo: título, autor, categoría y disponibilidad.
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import type { Book } from "../types";

export default function BookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  const { s, colors } = useTheme();
  const available = book.availableCopies > 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title}, de ${book.author}. ${available ? "Disponible" : "Sin ejemplares"}`}
      onPress={onPress}
      style={({ pressed }) => [s.card, { flexDirection: "row", gap: 14, minHeight: 112 }, pressed && s.pressed]}
    >
      {/* Ícono del libro */}
      <View style={{ width: 52, borderRadius: 10, backgroundColor: colors.accentSoft, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="book" size={26} color={colors.accent} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text numberOfLines={2} style={s.h3}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={s.muted}>
          {book.author}
        </Text>
        <View style={[s.row, { marginTop: "auto", justifyContent: "space-between" }]}>
          <Text numberOfLines={1} style={[s.small, { flexShrink: 1 }]}>
            {book.category}
            {book.year ? ` · ${book.year}` : ""}
          </Text>
          <Text style={[s.small, { fontWeight: "700", color: available ? colors.success : colors.error }]}>
            {available ? `${book.availableCopies} de ${book.totalCopies} disp.` : "Sin ejemplares"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
