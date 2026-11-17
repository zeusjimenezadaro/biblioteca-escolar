// Foto de perfil (si vino de una red social) o círculo con las iniciales.
import { Image, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { initials } from "../utils/roles";

type Props = { name: string; url?: string | null; size?: number };

export default function Avatar({ name, url, size = 56 }: Props) {
  const { s } = useTheme();
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (url) return <Image source={{ uri: url }} style={box} accessibilityLabel={`Foto de ${name}`} />;
  return (
    <View style={[s.avatar, box]}>
      <Text style={[s.avatarText, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}
