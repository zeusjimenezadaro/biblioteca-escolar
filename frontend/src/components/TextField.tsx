// Campo de texto con etiqueta, error visible debajo y opción de mostrar/ocultar contraseña.
import { forwardRef, useState } from "react";
import type { ComponentRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";

type Props = TextInputProps & {
  label: string;
  error?: string; // Mensaje de error del campo (se muestra en rojo).
  password?: boolean; // Agrega el botón del ojo para ver la contraseña.
};

const TextField = forwardRef<ComponentRef<typeof TextInput>, Props>(function TextField(
  { label, error, password, multiline, style, ...props },
  ref,
) {
  const { s, colors } = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          secureTextEntry={password && !visible}
          multiline={multiline}
          style={[s.input, multiline && s.inputMultiline, !!error && s.inputError, password && { paddingRight: 48 }, style]}
          {...props}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
          >
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={s.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default TextField;
