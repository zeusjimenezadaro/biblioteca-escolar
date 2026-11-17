// Ventana para confirmar acciones peligrosas (eliminar), dentro de la app y sin alert().
import { Modal, Pressable, Text, View } from "react-native";
import Button from "./Button";
import { useTheme } from "../theme/ThemeProvider";

type Props = {
  visible: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ visible, title, text, confirmLabel, loading, onConfirm, onCancel }: Props) {
  const { s } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Tocar el fondo oscuro también cancela */}
      <Pressable style={s.overlay} onPress={onCancel} accessibilityLabel="Cancelar">
        <Pressable style={s.dialog} onPress={() => {}}>
          <Text style={s.h2}>{title}</Text>
          <Text style={s.muted}>{text}</Text>
          <View style={s.row}>
            <Button label="Cancelar" variant="secondary" onPress={onCancel} grow disabled={loading} />
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} grow loading={loading} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
